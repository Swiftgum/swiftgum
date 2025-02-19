import { z } from "zod";

export interface Provider<ID extends string, I extends z.ZodTypeAny, T extends z.ZodTypeAny> {
	identifier: ID;
	indexingTask: I;
	internalTask: T;
}

const providerTask = <TId extends string, T extends z.ZodTypeAny>(
	providerId: TId,
	taskSchema: T,
) => {
	return z.object({
		provider: z.literal(providerId) as z.ZodLiteral<TId>,
		payload: taskSchema,
	});
};

export const createProviderTask = <TId extends string, T extends z.infer<z.ZodTypeAny>>(
	providerId: TId,
	task: T,
) => {
	return {
		payload: task,
		provider: providerId,
	};
};

export const parseProviderTask = (task: ReturnType<typeof createProviderTask>) => {
	return task.payload;
};

export const providerSchema = <ID extends string, I extends z.ZodTypeAny, T extends z.ZodTypeAny>({
	identifier,
	indexingTask,
	internalTask,
}: Provider<ID, I, T>) => {
	const wrappedIndexingTask = providerTask(identifier, indexingTask);
	const wrappedInternalTask = providerTask(identifier, internalTask);

	return {
		identifier,
		indexingTask,
		wrappedIndexingTask,
		internalTask,
		wrappedInternalTask,
	};
};
