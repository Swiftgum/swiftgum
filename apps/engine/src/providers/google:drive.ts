import fs from "node:fs";
import { pipeline } from "node:stream/promises";
import mime from "mime-types";
import { z } from "zod";
import { runMarkitdown } from "../parser";
import { tempFileName } from "../tmp";
import { type Provider, getInternalQueue } from "./abstract";

const HARD_PAGE_LIMIT = 100;
const PAGE_SIZE = 1000;
const PROVIDER = "google:drive" as const;

const fetchPage = async (accessToken: string, pageToken?: string) => {
	const url = new URL("https://www.googleapis.com/drive/v3/files");

	url.searchParams.set("includeItemsFromAllDrives", "true");
	url.searchParams.set("corpora", "allDrives");
	url.searchParams.set("supportsAllDrives", "true");
	url.searchParams.set("trashed", "false");
	url.searchParams.set("orderBy", "recency");
	url.searchParams.set("pageSize", PAGE_SIZE.toString());

	if (pageToken) url.searchParams.set("pageToken", pageToken);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data = await response.json();

	const { nextPageToken, files } = data;

	return { nextPageToken, files } as {
		nextPageToken?: string;
		files: {
			id: string;
			driveId?: string;
			teamDriveId?: string;
			name: string;
			mimeType: string;
		}[];
	};
};

const fetchAllPages = async (accessToken: string) => {
	let { files, nextPageToken } = await fetchPage(accessToken);
	let i = 0;

	while (nextPageToken && i < HARD_PAGE_LIMIT) {
		i++;

		const { files: pageFiles, nextPageToken: nextPage } = await fetchPage(
			accessToken,
			nextPageToken,
		);

		files.push(...pageFiles);

		nextPageToken = nextPage;
	}

	return files;
};

const googleDrivePendingTask = z.object({
	step: z.literal("pending"),
	fileId: z.string(),
	accessToken: z.string(),
});

const googleDriveInternalTask = z.discriminatedUnion("step", [googleDrivePendingTask]);

type GoogleDriveInternalTask = z.infer<typeof googleDriveInternalTask>;

const googleDriveInternalQueue = getInternalQueue(PROVIDER, googleDriveInternalTask);

export const googleDriveProvider: Provider<typeof PROVIDER, GoogleDriveInternalTask> = {
	provider: PROVIDER,
	index: async (task) => {
		const files = await fetchAllPages(task.accessToken);

		googleDriveInternalQueue.batchQueue(
			files.slice(0, 10).map((file) => ({
				step: "pending",
				fileId: file.id,
				accessToken: task.accessToken,
			})),
		);
	},
	internal: async (task) => {
		switch (task.step) {
			case "pending": {
				const response = await fetch(
					`https://www.googleapis.com/drive/v3/files/${task.fileId}/download`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${task.accessToken}`,
						},
					},
				);

				const data = await response.json();

				if (data.error) {
					console.error(data.error);

					if (data.error.code > 500) {
						console.error(data.error);
						return;
					}

					if (data.error.code > 400) {
						console.error(data.error);
						return;
					}
				} else {
					// ... existing code ...
					const downloadURI = data.response.downloadUri;

					const response = await fetch(downloadURI, {
						method: "GET",
						headers: {
							Authorization: `Bearer ${task.accessToken}`,
						},
					});

					// Get file extension from the response content-type or default to .txt
					const contentType = response.headers.get("content-type") || "text/plain";
					const extension = mime.extension(contentType) || "txt";

					// Create temp file with correct extension
					const tempFile = await tempFileName(extension, "google:drive-");

					// Pipe the response to the file
					const fileStream = fs.createWriteStream(tempFile.tempFile);

					await pipeline(response.body as unknown as NodeJS.ReadableStream, fileStream);

					console.log(`File saved to: ${tempFile.tempFile}`);

					const { textContents } = await runMarkitdown(tempFile.tempFile);

					console.log(textContents);

					await tempFile.cleanup();
				}

				break;
			}
		}
	},
};
