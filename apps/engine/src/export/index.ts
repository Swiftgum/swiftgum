import crypto from "node:crypto";
import { type ExportTask, exportTask } from "@knowledgex/shared/interfaces";
import { mergeResourceUris } from "@knowledgex/shared/log";
import type { DecryptedDestination } from "@knowledgex/shared/types/overload";
import { sql } from "../db";
import { QueueError } from "../queue";
import { log } from "../utils/log";

export const exportFile = async (task: Omit<ExportTask, "taskId">) => {
	// Safeguard
	const safeTask = exportTask.parse(task);

	await sql`
    SELECT * FROM pgmq.send_batch(
					queue_name => 'export_queue',
					msgs => ARRAY[
						${sql.array([JSON.stringify(safeTask)])}::jsonb[]
					]
				)
		`;
};

export const makeKxid = ({
	contentSignature,
	sourceId,
	providerId,
}: {
	contentSignature: string;
	sourceId: string;
	providerId: string;
}) => {
	const hash = crypto.createHash("sha256").update(`${contentSignature}-${sourceId}`).digest("hex");

	return `${providerId}/${hash}`;
};

export const getDestinations = async ({
	tokenId,
}: {
	tokenId: string;
}) => {
	const destinations = await sql`
		SELECT destinations.* FROM private.destinations_with_decrypted_params as destinations JOIN private.tokens ON tokens.workspace_id = destinations.workspace_id
		WHERE tokens.token_id = ${tokenId}
	`;

	return destinations as unknown as DecryptedDestination[];
};

export const processExport = async (task: ExportTask) => {
	// Safeguard
	const {
		task: { content, metadata },
	} = exportTask.parse(task);

	const destinations = await getDestinations({ tokenId: metadata.tokenId });

	for (const destination of destinations) {
		switch (destination.decrypted_destination_params.type) {
			case "webhook":
				try {
					const response = await fetch(destination.decrypted_destination_params.webhook.url, {
						method: "POST",
						body: JSON.stringify({ metadata, content }),
						headers: {
							"Content-Type": "application/json",
						},
					});

					if (!response.ok) {
						await log({
							id: mergeResourceUris(task.parentTaskIds || "", {
								task: task.taskId,
								destination: destination.destination_id,
							}),
							workspace_id: task.workspaceId,
							type: "webhook",
							name: "delivered:error",
							level: "error",
							metadata: {
								statusCode: response.status,
								destinationId: destination.destination_id,
								kxid: metadata.kxid,
							},
							private: false,
						});
						throw new QueueError(`Webhook delivery failed with status ${response.status}`);
					}

					await log({
						id: mergeResourceUris(task.parentTaskIds || "", {
							task: task.taskId,
							destination: destination.destination_id,
						}),
						workspace_id: task.workspaceId,
						type: "webhook",
						name: "delivered:success",
						level: "verbose",
						metadata: {
							destinationId: destination.destination_id,
							kxid: metadata.kxid,
						},
						private: false,
					});
				} catch (error) {
					if (error instanceof QueueError) {
						throw error;
					}
					// For any other error (network etc), requeue
					throw new QueueError(error instanceof Error ? error.message : String(error));
				}
				break;
		}
	}
};
