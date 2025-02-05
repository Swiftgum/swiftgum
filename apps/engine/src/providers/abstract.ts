import { z } from "zod";
import { sql } from "../db";
import type { IndexingTask, SupportedIndexers } from "./types";

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

export const parsingTask = z.object({
	provider: z.string(),
	source: z.object({
		url: z.string(),
	}),
});

export type ParsingTask = z.infer<typeof parsingTask>;

export const parsingQueue = {
	queue: async (task: ParsingTask) => {
		await sql`
			SELECT * FROM pgmq.send(
				queue_name => 'processing_queue',
				msg => ${JSON.stringify(task)}::jsonb
			)
		`;
	},
};
