import type { IndexingTask, SupportedIndexers } from "@knowledgex/shared/interfaces";
import type { z } from "zod";
import { sql } from "../db";

export interface Provider<P extends SupportedIndexers, I> {
	provider: P;
	index: (task: Extract<IndexingTask, { provider: P }>) => Promise<void>;
	internal: (task: I) => Promise<void>;
}

export interface InternalTask {
	provider: SupportedIndexers;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	task: any;
}

export const getInternalQueue = <T extends z.ZodTypeAny>(
	provider: SupportedIndexers,
	taskSchema: T,
) => {
	const batchQueue = async (tasks: z.infer<typeof taskSchema>[]) => {
		for (const task of tasks) {
			taskSchema.parse(task);
		}

		await sql`
				SELECT * FROM pgmq.send_batch(
					queue_name => 'internal_queue',
					msgs => ARRAY[
						${sql.array(
							tasks.map((task) =>
								JSON.stringify({
									provider,
									task,
								}),
							),
						)}::jsonb[]
					]
				)
			`;
	};

	return {
		queue: async (task: z.infer<typeof taskSchema>) => {
			return batchQueue([task]);
		},
		batchQueue,
	};
};
