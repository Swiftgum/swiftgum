import { type ExportTask, exportTask } from "@knowledgex/shared/interfaces";
import type { DecryptedDestination } from "@knowledgex/shared/types/overload";
import { sql } from "../db";

export const exportFile = async (task: ExportTask) => {
	// Safeguard
	exportTask.parse(task);

	await sql`
    SELECT * FROM pgmq.send_batch(
					queue_name => 'export_queue',
					msgs => ARRAY[
						${sql.array([JSON.stringify(task)])}::jsonb[]
					]
				)
		`;
};

export const getDestinations = async ({
	tokenId,
}: {
	tokenId: string;
}) => {
	const destinations = await sql`
		SELECT destinations.* FROM destinations_with_decrypted_params as destinations JOIN tokens ON tokens.workspace_id = destinations.workspace_id
		WHERE tokens.token_id = ${tokenId}
	`;

	return destinations as unknown as DecryptedDestination[];
};

export const processExport = async ({ content, metadata }: ExportTask) => {
	const destinations = await getDestinations({ tokenId: metadata.tokenId });

	// Safeguard
	exportTask.parse({ content, metadata });

	for (const destination of destinations) {
		switch (destination.decrypted_destination_params.type) {
			case "webhook":
				await fetch(destination.decrypted_destination_params.webhook.url, {
					method: "POST",
					body: content,
				});

				break;
		}
	}
};
