import { z } from "zod";

export const googleDriveIndexingTask = z.object({
	type: z.literal("google:drive"),
	accessToken: z.string(),
});

export const notionIndexingTask = z.object({
	type: z.literal("notion:notion"),
	accessToken: z.string(),
});

export const indexingTask = z.discriminatedUnion("type", [
	googleDriveIndexingTask,
	notionIndexingTask,
]);

export type IndexingTask = z.infer<typeof indexingTask>;

export type SupportedIndexers = IndexingTask["type"];

export const processingTask = z.object({});
