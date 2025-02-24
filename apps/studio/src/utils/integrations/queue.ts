import { type IndexingTaskSchema, indexingTaskSchema } from "@knowledgex/shared/interfaces";
import { log } from "@knowledgex/shared/log";
import { createServerOnlyClient } from "../supabase/server";

export const queueForIndexing = async (task: Omit<IndexingTaskSchema, "taskId">) => {
	const safeTask = indexingTaskSchema.parse(task);

	const client = await createServerOnlyClient();

	const { error } = await client.schema("private").rpc("queue_indexing_task", {
		task: safeTask,
	});

	if (error) {
		console.error(error);
		return;
	}

	if (process.env.KEEPALIVE_URL) {
		void fetch(process.env.KEEPALIVE_URL);
	}

	void log({
		level: "info",
		type: "integration",
		name: "indexing:starting",
		workspace_id: safeTask.workspaceId,
		end_user_id: safeTask.endUserId,
		id: {
			task: safeTask.taskId,
			end_user: safeTask.endUserId,
		},
		metadata: {
			task: safeTask,
		},
		private: false,
	});

	return safeTask;
};
