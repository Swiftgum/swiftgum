import fs from "node:fs";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { auth, drive_v3 } from "@googleapis/drive";
import mime from "mime-types";
import { z } from "zod";
import { exportFile } from "../export";
import { runMarkitdown } from "../parser";
import { tempFileName } from "../tmp";
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
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/bmp",
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
	accessToken: z.string(),
	mimeType: z.string(),
	exportLinks: z.record(z.string(), z.string()).optional(),
	fileSize: z.number().optional(),
});

const googleDriveInternalTask = z.discriminatedUnion("step", [googleDrivePendingTask]);

type GoogleDriveInternalTask = z.infer<typeof googleDriveInternalTask>;

const googleDriveInternalQueue = getInternalQueue(PROVIDER, googleDriveInternalTask);

export const googleDriveProvider: Provider<typeof PROVIDER, GoogleDriveInternalTask> = {
	provider: PROVIDER,
	index: async (task) => {
		const drive = getDrive(task);
		const files: drive_v3.Schema$File[] = [];
		let nextPageToken: string | undefined;
		let i = 0;

		while (i < 10000) {
			i++;

			const { data } = await drive.files.list({
				fields: "files(size,exportLinks,id,mimeType),nextPageToken",
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
				accessToken: task.accessToken,
				exportLinks: file.exportLinks ?? undefined,
				mimeType: file.mimeType,
				fileSize: file.size ? Number(file.size) : undefined,
			});
		}

		googleDriveInternalQueue.batchQueue(tasks);
	},
	internal: async (task) => {
		const drive = getDrive(task);

		switch (task.step) {
			case "pending": {
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

					console.log("here!");

					if (targetMimeType) {
						// Pipe fetch to readable stream
						const response = await fetch(task.exportLinks[targetMimeType]);

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

				if (!readableStream) {
					throw new Error("No readable stream found");
				}

				const extension = mime.extension(task.mimeType);

				if (!extension) {
					throw new Error("No extension found");
				}

				const { tempFile, cleanup } = await tempFileName(extension);

				await pipeline(readableStream, fs.createWriteStream(tempFile));

				const { textContents } = await runMarkitdown(tempFile);

				exportFile(textContents, {
					fileId: task.fileId,
					provider: PROVIDER,
				});

				await cleanup();
			}
		}
	},
};
