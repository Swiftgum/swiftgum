import type { IndexingTask } from "@knowledgex/interfaces";
import type { InternalTask } from "./abstract";
import { googleDriveProvider } from "./google:drive";

export const providers = {
	"google:drive": googleDriveProvider,
	"notion:notion": false,
} as const;

export const processIndexingTask = async (task: IndexingTask) => {
	if (!(task.provider in providers)) {
		throw new Error(`Provider for ${task.provider} not found`);
	}

	const provider = providers[task.provider];

	if (!provider) {
		throw new Error(`Provider for ${task.provider} not found`);
	}

	await provider.index(task);
};

export const processInternalTask = async (task: InternalTask) => {
	if (!(task.provider in providers)) {
		throw new Error(`Provider for ${task.provider} not found`);
	}

	const provider = providers[task.provider];

	await provider.internal(task.task);
};
