import { type IndexingTask, indexingTask } from "@knowledgex/shared";
import { createServerOnlyClient } from "../supabase/server";

export const queueForIndexing = async (task: IndexingTask) => {
	indexingTask.parse(task);

	const client = await createServerOnlyClient();

	const { data, error } = await client.schema("private").rpc("queue_indexing_task", {
		task,
	});

	if (error) {
		console.error(error);
	}

	console.log("done", data);
};
