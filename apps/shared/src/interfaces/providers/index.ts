import { z } from "zod";
import { asTask } from "../queue";
import { googleDriveSchema } from "./google:drive";
import { googleGmailSchema } from "./google:gmail";
import { notionSchema } from "./notion";
export * from "./provider";
import type { providerSchema } from "./provider";

export type ProviderSchema = ReturnType<typeof providerSchema>;

export const indexingTaskSchema = asTask(
	z.discriminatedUnion("provider", [
		googleDriveSchema.wrappedIndexingTask,
		notionSchema.wrappedIndexingTask,
		googleGmailSchema.wrappedIndexingTask,
	]),
);

export type IndexingTaskSchema = z.infer<typeof indexingTaskSchema>;

export const internalTaskSchemas = asTask(
	z.discriminatedUnion("provider", [
		googleDriveSchema.wrappedInternalTask,
		notionSchema.wrappedInternalTask,
		googleGmailSchema.wrappedInternalTask,
	]),
);

export type InternalTaskSchema = z.infer<typeof internalTaskSchemas>;
export type GenericTaskSchema = IndexingTaskSchema | InternalTaskSchema;

export { googleDriveSchema, notionSchema, googleGmailSchema };
export const providerSchemas = { googleDriveSchema, notionSchema, googleGmailSchema };
