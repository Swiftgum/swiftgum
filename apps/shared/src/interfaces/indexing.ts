import { z } from "zod";

export const genericIndexingTask = z.object({
	tokenId: z.string(),
});

export const googleDriveIndexingTask = genericIndexingTask.extend({
	provider: z.literal("google:drive"),
});

export const indexingTask = z.discriminatedUnion("provider", [googleDriveIndexingTask]);

export type IndexingTask = z.infer<typeof indexingTask>;

export type SupportedIndexers = IndexingTask["provider"];
