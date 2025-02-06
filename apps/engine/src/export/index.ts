import { sql } from "../db";

export const exportFile = async (
	content: string,
	metadata: { fileId: string; [key: string]: unknown },
) => {
	await sql`
    SELECT * FROM pgmq.send(
      queue_name => 'export_queue',
      msg => ${JSON.stringify({
				metadata,
				content: content,
			})}
    )
  `;
};
