import { z } from "zod";
import { sql } from "../db";

const exportMetadata = z.object({
	tokenId: z.string(),
	fileId: z.string(),
	remoteUrl: z.string(),
	fileName: z.string(),
	provider: z.string(),
});

export type ExportMetadata = z.infer<typeof exportMetadata>;

export const exportFile = async (content: string, metadata: ExportMetadata) => {
	await sql`
    SELECT * FROM pgmq.send_batch(
					queue_name => 'export_queue',
					msgs => ARRAY[
						${sql.array([
							JSON.stringify({
								content,
								metadata,
							}),
						])}::jsonb[]
					]
				)
		`;
};
