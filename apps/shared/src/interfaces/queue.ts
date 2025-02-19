import { v4 as uuid } from "@lukeed/uuid/secure";
import { z } from "zod";

export const genericQueueTask = z.object({
	taskId: z.string().uuid().default(uuid()),
	workspaceId: z.string().uuid(),
	endUserId: z.string().uuid().optional(),
	parentTaskIds: z.string().optional(),
	parentTags: z.string().array().optional(),
	task: z.any().optional(),
});

export type GenericQueueTask = z.infer<typeof genericQueueTask>;
export type CreateGenericQueueTask = z.input<typeof genericQueueTask>;

export const asTask = <T extends z.ZodTypeAny>(schema: T) => {
	return genericQueueTask.extend({
		task: schema,
	});
};

/**
 * Creates and validates a queue task.
 */
export const createQueueTask = <T extends z.infer<z.ZodTypeAny>>(
	task: T,
	params: Omit<CreateGenericQueueTask, "task">,
) => {
	const preparedTask = {
		...params,
		task,
	} satisfies CreateGenericQueueTask;

	return genericQueueTask.parse(preparedTask);
};

export const parseQueueTask = (task: GenericQueueTask) => {
	return task.task;
};
