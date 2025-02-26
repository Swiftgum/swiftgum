import { z } from "zod";
import { providerSchema } from "../provider";
import { storedToken } from "../shared";

const notionPendingTask = z.object({
	step: z.literal("pending"),
	pageId: z.string(),
	tokenId: z.string(),
	title: z.string(),
	remoteUrl: z.string(),
});

const notionInternalTask = z.discriminatedUnion("step", [notionPendingTask]);

export const notionSchema = providerSchema({
	identifier: "notion" as const,
	indexingTask: storedToken,
	internalTask: notionInternalTask,
});
