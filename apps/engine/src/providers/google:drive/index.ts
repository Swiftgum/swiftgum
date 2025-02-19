import fs from "node:fs";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { auth, drive_v3 } from "@googleapis/drive";
import { providerSchemas } from "@knowledgex/shared/interfaces";
import mime from "mime-types";
import type { z } from "zod";
import { exportFile } from "../../export";
import { runMarkitdown } from "../../parser";
import { tempFileName } from "../../tmp";
import { getToken } from "../../utils/token";
import { provider } from "../abstract";

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

const OTHER_SUPPORTED_MIME_TYPES = ["application/pdf"];
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

export const googleDriveProvider = provider({
	schema: providerSchemas.googleDriveSchema,
	internal: async ({ task }) => {
		const token = await getToken(task);

		const drive = getDrive({
			accessToken: token.decrypted_tokenset.oauth2.access_token,
		});

		if (task.step === "pending") {
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

				if (!readableStream) {
					throw new Error("No readable stream found");
				}

				const extension = mime.extension(task.mimeType);

				if (!extension) {
					throw new Error("No extension found");
				}

				const { tempFile, cleanup } = await tempFileName({ extension });

				try {
					await pipeline(readableStream, fs.createWriteStream(tempFile));

					const { textContents } = await runMarkitdown(tempFile);

					await exportFile({
						workspaceId: token.workspace_id,
						task: {
							content: textContents,
							metadata: {
								fileId: task.fileId,
								fileName: task.fileName,
								remoteUrl: task.remoteUrl,
								provider: "google:drive",
								tokenId: task.tokenId,
								mimeType: task.mimeType,
							},
						},
					});
				} finally {
					await cleanup();
				}
			} catch (error) {
				console.error(error);
				throw error;
			}
		}
	},
	indexing: async ({ task, queue }) => {
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

		const tasks: z.infer<typeof providerSchemas.googleDriveSchema.internalTask>[] = [];

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

		queue.batchQueue(tasks);
	},
});
