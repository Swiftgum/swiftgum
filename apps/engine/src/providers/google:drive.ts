import fs from "node:fs";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { auth, drive_v3 } from "@googleapis/drive";
import mime from "mime-types";
import { z } from "zod";
import { exportFile } from "../export";
import { runMarkitdown } from "../parser";
import { tempFileName } from "../tmp";
import { getToken } from "../utils/token";
import { type Provider, getInternalQueue } from "./abstract";

const PROVIDER = "google:drive" as const;

const DRIVE_MIME_TYPES = [
	"application/vnd.google-apps.document",
	"application/vnd.google-apps.spreadsheet",
	"application/vnd.google-apps.presentation",
	"application/vnd.google-apps.drawing",
];
const DRIVE_MIME_TYPES_MAPPING = {
	"application/vnd.google-apps.document":
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.google-apps.spreadsheet":
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.google-apps.presentation":
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.google-apps.drawing": "image/png",
};
const OTHER_SUPPORTED_MIME_TYPES = [
	"application/pdf",
	//"image/jpeg",
	//"image/png",
	//"image/gif",
	//"image/bmp",
];
const ALLOWED_MIME_TYPES = [...DRIVE_MIME_TYPES, ...OTHER_SUPPORTED_MIME_TYPES];
const MAX_DRIVE_EXPORT_SIZE = 1e7; // 10MB

const getDrive = ({
	accessToken,
}: {
	accessToken: string;
}) => {
	const authClient = new auth.OAuth2();
	authClient.setCredentials({ access_token: accessToken });

	return new drive_v3.Drive({ auth: authClient });
};

const googleDrivePendingTask = z.object({
	step: z.literal("pending"),
	fileId: z.string(),
	mimeType: z.string(),
	exportLinks: z.record(z.string(), z.string()).optional(),
	fileSize: z.number().optional(),
	tokenId: z.string(),
	fileName: z.string(),
	remoteUrl: z.string(),
});

const googleDriveInternalTask = z.discriminatedUnion("step", [googleDrivePendingTask]);

type GoogleDriveInternalTask = z.infer<typeof googleDriveInternalTask>;

const googleDriveInternalQueue = getInternalQueue(PROVIDER, googleDriveInternalTask);

export const googleDriveProvider: Provider<typeof PROVIDER, GoogleDriveInternalTask> = {
	provider: PROVIDER,
	index: async (task) => {
		const token = await getToken(task);

		const drive = getDrive({
			accessToken: token.decrypted_tokenset.oauth2.access_token,
		});

		const files: drive_v3.Schema$File[] = [];
		let nextPageToken: string | undefined;
		let i = 0;

		while (i < 10000) {
			i++;

			const { data } = await drive.files.list({
				fields: "files(size,exportLinks,id,mimeType,name,webViewLink),nextPageToken",
				pageSize: 1000,
				pageToken: nextPageToken,
			});

			if (!data.files) {
				break;
			}

			files.push(...data.files);

			if (!data.nextPageToken) {
				break;
			}

			nextPageToken = data.nextPageToken;
		}

		const tasks: GoogleDriveInternalTask[] = [];

		for (const file of files) {
			if (!file.id || !file.mimeType) {
				continue;
			}

			if (!ALLOWED_MIME_TYPES.includes(file.mimeType)) {
				continue;
			}

			tasks.push({
				step: "pending",
				fileId: file.id,
				exportLinks: file.exportLinks ?? undefined,
				mimeType: file.mimeType,
				fileSize: file.size ? Number(file.size) : undefined,
				tokenId: task.tokenId,
				fileName: file.name ?? "",
				remoteUrl: file.webViewLink ?? "",
			});
		}

		googleDriveInternalQueue.batchQueue(tasks);
	},
	internal: async (task) => {
		const token = await getToken(task);

		const drive = getDrive({
			accessToken: token.decrypted_tokenset.oauth2.access_token,
		});

		switch (task.step) {
			case "pending": {
				console.log("starting task", new Date().toISOString());
				try {
					let readableStream: Readable | undefined;
					if (
						DRIVE_MIME_TYPES.includes(task.mimeType) &&
						task.fileSize &&
						task.fileSize < MAX_DRIVE_EXPORT_SIZE
					) {
						const stream = await drive.files.export(
							{
								fileId: task.fileId,
								alt: "media",
								mimeType:
									DRIVE_MIME_TYPES_MAPPING[task.mimeType as keyof typeof DRIVE_MIME_TYPES_MAPPING],
							},
							{
								responseType: "stream",
							},
						);

						readableStream = stream.data;
					} else if (task.exportLinks) {
						let targetMimeType = Object.keys(task.exportLinks).find((mimeType) =>
							ALLOWED_MIME_TYPES.includes(mimeType),
						);

						if (!targetMimeType && "application/pdf" in task.exportLinks) {
							targetMimeType = "application/pdf";
						}

						if (targetMimeType) {
							// Pipe fetch to readable stream
							const response = await fetch(task.exportLinks[targetMimeType], {
								headers: {
									Authorization: `Bearer ${token.decrypted_tokenset.oauth2.access_token}`,
								},
							});

							readableStream = response.body as unknown as Readable;
						}
					} else {
						const stream = await drive.files.get(
							{
								fileId: task.fileId,
								alt: "media",
							},
							{
								responseType: "stream",
							},
						);

						readableStream = stream.data;
					}

					console.log("readable stream obtained");

					if (!readableStream) {
						throw new Error("No readable stream found");
					}

					const extension = mime.extension(task.mimeType);

					if (!extension) {
						throw new Error("No extension found");
					}

					console.log("extension found");

					const { tempFile, cleanup } = await tempFileName({ extension });

					console.log("temp file created");

					try {
						await pipeline(readableStream, fs.createWriteStream(tempFile));

						console.log("pipeline completed");

						const { textContents } = await runMarkitdown(tempFile);

						console.log("markdown completed");

						exportFile(textContents, {
							fileId: task.fileId,
							fileName: task.fileName,
							remoteUrl: task.remoteUrl,
							provider: PROVIDER,
							tokenId: task.tokenId,
						});
					} catch (err) {
						console.error(err);
						throw err;
					} finally {
						await cleanup();
					}

					console.log("task completed", new Date().toISOString());
				} catch (error) {
					console.error(error);
				}
			}
		}
	},
};
