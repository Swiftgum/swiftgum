import type { IndexingTaskSchema, InternalTaskSchema } from "@knowledgex/shared/interfaces";
import { googleDriveProvider } from "./google:drive/index";

export const providers = [googleDriveProvider] as const;

const getProvider = (task: IndexingTaskSchema | InternalTaskSchema) => {
	const targetProvider = providers.find((provider) => provider.owns(task));

	if (!targetProvider) throw new Error(`Provider not found for task ${task.task.provider}`);

	return targetProvider;
};

export const processIndexingTask = async (task: IndexingTaskSchema) => {
	const targetProvider = getProvider(task);

	await targetProvider.indexing(task);
};

export const processInternalTask = async (task: InternalTaskSchema) => {
	const targetProvider = getProvider(task);

	await targetProvider.internal(task);
};
