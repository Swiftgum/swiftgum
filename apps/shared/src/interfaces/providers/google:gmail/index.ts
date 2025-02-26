import { z } from "zod";
import { providerSchema } from "../provider";
import { storedToken } from "../shared";

const googleGmailPendingTask = z.object({
	step: z.literal("pending"),
	messageId: z.string(),
	tokenId: z.string(),
	title: z.string(),
	remoteUrl: z.string(),
});

const googleGmailInternalTask = z.discriminatedUnion("step", [googleGmailPendingTask]);

export const googleGmailSchema = providerSchema({
	identifier: "google:gmail" as const,
	indexingTask: storedToken,
	internalTask: googleGmailInternalTask,
});
