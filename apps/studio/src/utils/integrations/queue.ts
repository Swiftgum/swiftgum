import { type IndexingTask, indexingTask } from "@knowledgex/interfaces";
import { createClient } from "../supabase/server";

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
