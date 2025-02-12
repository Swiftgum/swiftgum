import { z } from "zod";

export const oauth2IntegrationCredentials = z.object({
	type: z.literal("oauth2"),
	oauth2: z.object({
		url: z.string(),
		client_id: z.string(),
		client_secret: z.string(),
	}),
});

export type Oauth2IntegrationCredentials = z.infer<typeof oauth2IntegrationCredentials>;

export const integrationCredentials = z.discriminatedUnion("type", [oauth2IntegrationCredentials]);

export type IntegrationCredentials = z.infer<typeof integrationCredentials>;
