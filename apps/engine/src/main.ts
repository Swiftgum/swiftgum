// Import the framework and instantiate it
import Fastify from "fastify";
// import { addQueueListener } from "./queue";

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

		/* await addQueueListener("indexing_queue", () => {
			console.log("test");
		}); */
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
