import type { IndexingTaskSchema, InternalTaskSchema } from "@knowledgex/shared/interfaces";
import { googleDriveProvider } from "./google:drive";
import { notionProvider } from "./notion";

export const providers = [googleDriveProvider, notionProvider] as const;

const getProvider = (task: IndexingTaskSchema | InternalTaskSchema) => {
	const targetProvider = providers.find((provider) => provider.owns(task));

	if (!targetProvider) throw new Error(`Provider not found for task ${task.task.provider}`);

	return targetProvider;
};

export const processIndexingTask = async (task: IndexingTaskSchema) => {
	const targetProvider = getProvider(task);

	// @ts-expect-error - Type system limitation, but this is safe at runtime
	await targetProvider.indexing(task);
};

export const processInternalTask = async (task: InternalTaskSchema) => {
	const targetProvider = getProvider(task);

	// @ts-expect-error - Type system limitation, but this is safe at runtime
	await targetProvider.internal(task);
};
