import { z } from "zod";
import type { Database } from "../types/database-server";
import type { ResourceUri } from "./uri";

const logSchema = z.object({
	timestamp: z.string().datetime(),
	workspace_id: z.string().uuid().optional(),
	end_user_id: z.string().uuid().optional(),
	user_id: z.string().uuid().optional(),
	level: z.enum(["verbose", "info", "security", "warning", "error", "debug"]),
	id: z.string().max(2048).optional(),
	metadata: z.any().optional(),
	private: z.boolean().optional(),
});

// Portal session logs
export const portalLogEvent = logSchema.extend({
	type: z.literal("portal-session"),
	name: z.enum(["created", "signed", "claimed", "retrieved"]),
});

export const portalAuthSessionLogEvent = logSchema.extend({
	type: z.literal("portal-auth-session"),
	name: z.enum(["created", "claimed", "ghost-claimed", "error"]),
});

export const tokenLogEvent = logSchema.extend({
	type: z.literal("token"),
	name: z.enum(["created", "rotated", "retrieved"]),
});

export const adminAuthLogEvent = logSchema.extend({
	type: z.literal("admin-auth"),
	name: z.enum(["sign-in", "sign-out"]),
});

export const apiKeyLogEvent = logSchema.extend({
	type: z.literal("api-key"),
	name: z.enum(["created", "rotated", "read", "compromised"]),
});

export const integrationLogEvent = logSchema.extend({
	type: z.literal("integration"),
	name: z.enum([
		"indexing:starting",
		"indexing:started",
		"indexing:completed",
		"indexing:failed",
		"internal:started",
		"internal:completed",
		"internal:failed",
		"configuration:changed",
	]),
});

export const destinationLogEvent = logSchema.extend({
	type: z.literal("destination"),
	name: z.enum(["configuration:changed"]),
});

export const exportLogEvent = logSchema.extend({
	type: z.literal("export"),
	name: z.enum(["started", "completed", "failed"]),
});

export const queueNames = z.enum([
	"queue:indexing",
	"queue:internal",
	"queue:parsing",
	"queue:export",
]);

export type QueueName = z.infer<typeof queueNames>;

export const queueLogEvent = logSchema.extend({
	type: queueNames,
	name: z.enum(["started", "completed", "failed", "timeout"]),
});

// Create a discriminated union of all log events
export const logEvent = z.discriminatedUnion("type", [
	portalLogEvent,
	portalAuthSessionLogEvent,
	tokenLogEvent,
	adminAuthLogEvent,
	integrationLogEvent,
	destinationLogEvent,
	exportLogEvent,
	queueLogEvent,
	apiKeyLogEvent,
]) satisfies z.ZodType<Database["public"]["Tables"]["logs"]["Insert"]>;

export const resourceTypes = z.enum([
	"integration",
	"token",
	"auth_session",
	"portal_session",
	"task",
	"end_user",
	"provider",
	"destination",
]);

// Export the type for TypeScript usage
export type LogSchema = z.infer<typeof logEvent>;

export type LogInput = Omit<LogSchema, "timestamp" | "id"> & {
	timestamp?: string;
	id?: ResourceUri;
};
export type Log = Omit<Database["public"]["Tables"]["logs"]["Row"], keyof LogSchema> & LogSchema;
