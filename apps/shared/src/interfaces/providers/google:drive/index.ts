import { z } from "zod";
import { providerSchema } from "../provider";
import { storedToken } from "../shared";

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

export const googleDriveSchema = providerSchema({
	identifier: "google:drive" as const,
	indexingTask: storedToken,
	internalTask: googleDriveInternalTask,
});
