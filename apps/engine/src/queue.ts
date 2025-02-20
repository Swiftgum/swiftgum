import type { GenericQueueTask } from "@knowledgex/shared/interfaces";
import { type QueueName, mergeResourceUris } from "@knowledgex/shared/log";
import type postgres from "postgres";
import { sql } from "./db";
import { keepAlive } from "./utils/keepalive";
import { log } from "./utils/log";

// Contains a public reason property that will be logged
export class QueueError extends Error {
	reason: string;

	constructor(reason: string) {
		super(reason);
		this.reason = reason;
	}
}

export class FinalQueueError extends QueueError {}

const getNextMessage = async (queueName: string, timeout = 60) => {
	const result = await sql`
    SELECT * FROM pgmq.read(
      queue_name => ${queueName},
      vt => ${timeout},
      qty => 1
    )
  `;

	return result[0] as {
		msg_id: string;
		message: GenericQueueTask;
	};
};

export const getQueueSize = async (queueName: string) => {
	const queueTableName = `pgmq.q_${queueName.split(":")[1]}_queue`;

	const result = await sql`
		SELECT count(*) FROM ${sql(queueTableName)}
	`;

	return result[0] as { count: number };
};

const archiveMessage = async (queueName: string, messageId: string) => {
	await sql`
    SELECT pgmq.archive(
      queue_name => ${queueName},
      msg_id => ${messageId}
    )
  `;
};

/**
 * @param queueName - The name of the queue to listen to
 * @param handler - The handler to call when a message is received. If the handler throws an error, the message will be requeued. If the handler takes longer than the timeout, the message will be requeued.
 * @param timeout - The timeout for the message to be processed in seconds
 */
export const addQueueListener = async (
	queueName: QueueName,
	handler: (row?: postgres.Row) => unknown,
	timeout = 120,
	maxErrors = 5 * 60,
) => {
	const realQueueName = `${queueName.replace("queue:", "")}_queue`;

	// Safeguard if the queue does not exist, or the database is unreachable on startup.
	try {
		await getNextMessage(realQueueName, 0);
	} catch (error) {
		console.error(`Error reading from queue ${realQueueName}: ${error}`);
		return; // TODO: throw error?
		// throw error;
	}

	while (true) {
		try {
			const message = await getNextMessage(realQueueName, timeout);

			if (message) {
				keepAlive();

				const timeoutHandle = setTimeout(() => {
					log({
						level: "warning",
						type: queueName,
						name: "timeout",
					});
				}, timeout * 1000);

				void log({
					level: "verbose",
					type: queueName,
					name: "started",
					workspace_id: message.message.workspaceId,
					id: mergeResourceUris(message.message.parentTaskIds || "", {
						task: message.message.taskId,
					}),
					metadata: {},
					private: false,
				});

				try {
					await handler(message);

					void log({
						level: "verbose",
						type: queueName,
						name: "completed",
						workspace_id: message.message.workspaceId,
						id: mergeResourceUris(message.message.parentTaskIds || "", {
							task: message.message.taskId,
						}),
						metadata: {},
						private: false,
					});

					try {
						clearTimeout(timeoutHandle);
						console.log(`Handler for queue ${realQueueName} ran on time.`);
					} catch {}

					await archiveMessage(realQueueName, message.msg_id);
				} catch (error) {
					console.error(error);

					const errorReason = error instanceof QueueError ? error.reason : "Unknown error";

					void log({
						level: "error",
						type: queueName,
						name: "failed",
						workspace_id: message.message.workspaceId,
						id: mergeResourceUris(message.message.parentTaskIds || "", {
							task: message.message.taskId,
						}),
						metadata: { error: errorReason },
						private: false,
					});

					// If it's a FinalQueueError, we still want to remove the message from the queue
					if (error instanceof FinalQueueError) {
						await archiveMessage(realQueueName, message.msg_id);
					}
				}

				// If a message has been read, we can process a new one immediately.
				continue;
			}
		} catch (error) {
			console.error(error);

			void log({
				level: "error",
				type: queueName,
				name: "failed",
				metadata: {},
			});
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
};
