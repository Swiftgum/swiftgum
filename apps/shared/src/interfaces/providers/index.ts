import { z } from "zod";
import { asTask } from "../queue";
import { googleDriveSchema } from "./google:drive";
export * from "./provider";
import type { providerSchema } from "./provider";

export type ProviderSchema = ReturnType<typeof providerSchema>;

export const indexingTaskSchema = asTask(
	z.discriminatedUnion("provider", [googleDriveSchema.wrappedIndexingTask]),
);

export type IndexingTaskSchema = z.infer<typeof indexingTaskSchema>;

export const internalTaskSchemas = asTask(
	z.discriminatedUnion("provider", [googleDriveSchema.wrappedInternalTask]),
);

export type InternalTaskSchema = z.infer<typeof internalTaskSchemas>;
export type GenericTaskSchema = IndexingTaskSchema | InternalTaskSchema;

export { googleDriveSchema };
export const providerSchemas = [googleDriveSchema];
