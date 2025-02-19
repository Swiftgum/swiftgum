import {
	type GenericQueueTask,
	type IndexingTaskSchema,
	type InternalTaskSchema,
	type ProviderSchema,
	createProviderTask,
	createQueueTask,
	parseProviderTask,
	parseQueueTask,
} from "@knowledgex/shared/interfaces";
import { mergeResourceUris } from "@knowledgex/shared/log";
import type { z } from "zod";
import { sql } from "../db";

const createQueue = <TId extends string, I extends z.ZodTypeAny>({
	provider,
	schema,
}: {
	provider: TId;
	schema: I;
}) => {
	return (parentTask: GenericQueueTask) => {
		const serializeTask = (task: z.infer<I>["payload"]) => {
			const safeTask = schema.parse(createProviderTask(provider, task));
			const finalTask = createQueueTask(safeTask, {
				workspaceId: parentTask.workspaceId,
				endUserId: parentTask.endUserId,
				parentTaskIds: mergeResourceUris(parentTask.parentTaskIds || "", {
					task: parentTask.taskId,
				}),
			});

			return JSON.stringify(finalTask);
		};

		const batchQueue = async (tasks: z.infer<I>["payload"][]) => {
			const serializedTasks = tasks.map(serializeTask);

			await sql`
				SELECT * FROM pgmq.send_batch(
					queue_name => 'internal_queue',
					msgs => ARRAY[
						${sql.array(serializedTasks)}::jsonb[]
					]
				)
			`;
		};

		return {
			queue: (task: z.infer<I>["payload"]) => batchQueue([task]),
			batchQueue,
		};
	};
};

type QueueHandler<TId extends string, I extends z.ZodTypeAny, IT extends z.ZodTypeAny> = ({
	task,
}: {
	// NB: I is the inbound task schema
	task: z.infer<I>["payload"];
	// Whereas IT is the outbound task schema, which is always the internal task schema
	queue: ReturnType<ReturnType<typeof createQueue<TId, IT>>>;
}) => Promise<void>;

interface Provider<S extends ProviderSchema> {
	schema: S;
	internal: QueueHandler<S["identifier"], S["wrappedInternalTask"], S["wrappedInternalTask"]>;
	indexing: QueueHandler<S["identifier"], S["wrappedIndexingTask"], S["wrappedInternalTask"]>;
}

export const provider = <S extends ProviderSchema>({ schema, internal, indexing }: Provider<S>) => {
	const queue = createQueue({ provider: schema.identifier, schema: schema.wrappedInternalTask });
	const owns = ({ task }: InternalTaskSchema | IndexingTaskSchema) =>
		task.provider === schema.identifier;

	return {
		schema,
		owns,
		internal: (parentTask: Extract<InternalTaskSchema, { task: { provider: S["identifier"] } }>) =>
			internal({ task: parseProviderTask(parseQueueTask(parentTask)), queue: queue(parentTask) }),
		indexing: (parentTask: Extract<IndexingTaskSchema, { task: { provider: S["identifier"] } }>) =>
			indexing({ task: parseProviderTask(parseQueueTask(parentTask)), queue: queue(parentTask) }),
	};
};
