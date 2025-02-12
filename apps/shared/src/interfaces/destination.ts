import { z } from "zod";

const webhookDestination = z.object({
	type: z.literal("webhook"),
	webhook: z.object({
		url: z.string(),
	}),
});

export type WebhookDestination = z.infer<typeof webhookDestination>;

const destination = z.discriminatedUnion("type", [webhookDestination]);

export type Destination = z.infer<typeof destination>;
