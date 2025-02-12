import { z } from "zod";

export const exportTask = z.object({
	content: z.string(),
	metadata: z.object({
		tokenId: z.string(),
		fileId: z.string(),
		remoteUrl: z.string(),
		fileName: z.string(),
		provider: z.string(),
		mimeType: z.string(),
	}),
});

export type ExportTask = z.infer<typeof exportTask>;
