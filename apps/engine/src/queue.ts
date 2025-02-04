import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not set");
}

const sql = postgres(process.env.POSTGRES_URL);

const getNextMessage = async (queueName: string, timeout = 60) => {
	const result = await sql`
    SELECT * FROM pgmq.read(
      queue_name => ${queueName},
      vt => ${timeout},
      qty => 1
    )
  `;

	return result[0];
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
 * @param timeout - The timeout for the message to be processed
 */
export const addQueueListener = async (
	queueName: string,
	handler: (row?: postgres.Row) => unknown,
	timeout = 120,
	maxErrors = 10,
) => {
	// Safeguard if the queue does not exist, or the database is unreachable on startup.
	try {
		await getNextMessage(queueName, 0);
	} catch (error) {
		console.error(`Error reading from queue ${queueName}: ${error}`);
		return; // TODO: throw error?
		// throw error;
	}

	let errors = 0;

	while (errors < maxErrors) {
		try {
			const message = await getNextMessage(queueName, timeout);
			errors = 0;

			if (message) {
				const timeoutHandle = setTimeout(() => {
					console.warn(
						`Handler for queue ${queueName} took more than ${timeout} seconds, the message has been requeued prematurely.`,
					);
				}, timeout);

				await handler(message);

				try {
					clearTimeout(timeoutHandle);
					console.log(`Handler for queue ${queueName} ran on time.`);
				} catch {}

				console.log(message);

				await archiveMessage(queueName, message.msg_id);

				// If a message has been read, we can process a new one immediately.
				continue;
			}

			console.info(`No message found in queue ${queueName}, sleeping...`);
		} catch (error) {
			errors++;
			console.error(`Error reading from queue ${queueName}: ${error}`);
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	throw new Error(`Max errors reached for queue ${queueName}`);
};
