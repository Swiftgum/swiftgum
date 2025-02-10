import { z } from "zod";

export const genericIndexingTask = z.object({
	tokenId: z.string(),
});

export const googleDriveIndexingTask = genericIndexingTask.extend({
	provider: z.literal("google:drive"),
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
