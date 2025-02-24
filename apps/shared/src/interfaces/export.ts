import { z } from "zod";
import { asTask } from "./queue";

export const exportTask = asTask(
	z.object({
		content: z.string(),
		metadata: z.object({
			tokenId: z.string(),
			fileId: z.string(),
			remoteUrl: z.string(),
			fileName: z.string(),
			provider: z.string(),
			mimeType: z.string(),
			sgid: z.string(),
		}),
	}),
);

export type ExportTask = z.infer<typeof exportTask>;
