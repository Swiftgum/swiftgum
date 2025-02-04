import type { Provider } from "./abstract";
import { googleDriveProvider } from "./google:drive";
import type { IndexingTask, SupportedIndexers } from "./types";

export const providers = new Map<SupportedIndexers, Provider<SupportedIndexers>>(
	[googleDriveProvider].map((provider) => [provider.type, provider as Provider<SupportedIndexers>]),
);

export const processIndexingTask = async (task: IndexingTask) => {
	const provider = providers.get(task.type);

	if (!provider) {
		throw new Error(`Provider for ${task.type} not found`);
	}

	await provider.index(task);
};
