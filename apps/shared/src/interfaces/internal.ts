import { z } from "zod";

export const genericInternalTask = z.object({
	provider: z.string(),
	task: z.any(),
});

export type GenericInternalTask = z.infer<typeof genericInternalTask>;
