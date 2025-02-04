import { createClient } from "../supabase/server";
import { type IndexingTask, indexingTask } from "./schemas/definitions";

export const queueForIndexing = async (task: IndexingTask) => {
	indexingTask.parse(task);

	const client = await createClient();

	const { data, error } = await client.rpc("queue_indexing_task", {
		task,
	});

	if (error) {
		console.error(error);
	}

	console.log("done", data);
};
