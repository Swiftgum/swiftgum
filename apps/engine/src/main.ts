import Fastify from "fastify";
import { processExport } from "./export";
import { processIndexingTask, processInternalTask } from "./providers";
import { addQueueListener, getQueueSize } from "./queue";

const fastify = Fastify({
	logger: true,
});

// Declare a route
fastify.get("/health", async function handler() {
	return {
		status: "healthy",
	};
});

const lastProcessed = {
	indexing: null,
	internal: null,
	export: null,
} as Record<string, Date | null>;

fastify.get("/queues", async function handler() {
	return {
		queues: {
			indexing: {
				size: await getQueueSize("queue:indexing"),
				lastProcessed: lastProcessed.indexing,
			},
			internal: {
				size: await getQueueSize("queue:internal"),
				lastProcessed: lastProcessed.internal,
			},
			export: {
				size: await getQueueSize("queue:export"),
				lastProcessed: lastProcessed.export,
			},
		},
	};
});

const start = async () => {
	// Run the server!
	try {
		await fastify.listen({ host: "0.0.0.0", port: 8000 });

		void addQueueListener("queue:indexing", async (row) => {
			if (!row) {
				return;
			}

			await processIndexingTask(row.message);

			lastProcessed.indexing = new Date();
		});

		for (let i = 0; i < 5; i++) {
			void addQueueListener("queue:internal", async (row) => {
				if (!row) {
					return;
				}

				await processInternalTask(row.message);

				lastProcessed.internal = new Date();
			});
		}

		for (let i = 0; i < 5; i++) {
			void addQueueListener("queue:export", async (row) => {
				if (!row) {
					return;
				}

				await processExport(row.message);

				lastProcessed.export = new Date();
			});
		}

		console.log("Started");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
