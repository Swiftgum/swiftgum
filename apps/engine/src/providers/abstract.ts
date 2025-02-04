import type { IndexingTask, SupportedIndexers } from "./types";

export interface Provider<T extends SupportedIndexers> {
	type: SupportedIndexers;
	index(task: Extract<IndexingTask, { type: T }>): Promise<void>;
}
