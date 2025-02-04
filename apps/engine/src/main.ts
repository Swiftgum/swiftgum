// Import the framework and instantiate it
import Fastify from "fastify";
import { processIndexingTask } from "./providers";
import { indexingTask } from "./providers/types";
import { addQueueListener } from "./queue";

const fastify = Fastify({
	logger: true,
});

// Declare a route
fastify.get("/health", async function handler(request, reply) {
	return { status: "healthy" };
});

const start = async () => {
	// Run the server!
	try {
		await fastify.listen({ host: "0.0.0.0", port: 8000 });

		await addQueueListener("indexing_queue", (row) => {
			if (!row) {
				return;
			}

			const task = indexingTask.parse(row.message);

			console.log(task);

			processIndexingTask(task);
		});
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
