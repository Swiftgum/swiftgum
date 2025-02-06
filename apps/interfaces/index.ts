import { z } from "zod";

export const googleDriveIndexingTask = z.object({
	provider: z.literal("google:drive"),
	accessToken: z.string(),
});

/* export const notionIndexingTask = z.object({
	provider: z.literal("notion:notion"),
	accessToken: z.string(),
}); */

export const indexingTask = z.discriminatedUnion("provider", [
	googleDriveIndexingTask,
	// notionIndexingTask,
]);

export type IndexingTask = z.infer<typeof indexingTask>;

export type SupportedIndexers = IndexingTask["provider"];

export const processingTask = z.object({});
