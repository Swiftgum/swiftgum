import { indexingTask } from "@knowledgex/shared";
// Import the framework and instantiate it
import Fastify from "fastify";
import { processExport } from "./export";
import { processIndexingTask, processInternalTask } from "./providers";
import { addQueueListener } from "./queue";

const fastify = Fastify({
	logger: true,
});

// Declare a route
fastify.get("/health", async function handler() {
	return { status: "healthy" };
});

const start = async () => {
	// Run the server!
	try {
		await fastify.listen({ host: "0.0.0.0", port: 8000 });

		void addQueueListener("indexing_queue", async (row) => {
			if (!row) {
				return;
			}

			const task = indexingTask.parse(row.message);

			await processIndexingTask(task);
		});

		for (let i = 0; i < 20; i++) {
			void addQueueListener(
				"internal_queue",
				async (row) => {
					if (!row) {
						return;
					}

					await processInternalTask(row.message);
				},
				10 * 60,
			);
		}

		for (let i = 0; i < 20; i++) {
			void addQueueListener("export_queue", async (row) => {
				if (!row) {
					return;
				}

				await processExport(row.message);
			});
		}

		console.log("Started");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
