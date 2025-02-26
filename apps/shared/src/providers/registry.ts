import { z } from "zod";
import type { ProviderAuthProvider } from "./generic/auth";

import { googleDriveAuth } from "./google:drive/auth";
import { googleGmailAuth } from "./google:gmail/auth";
import { notionAuth } from "./notion/auth";

export const authProviders = [
	googleDriveAuth,
	googleGmailAuth,
	notionAuth,
] as const satisfies ProviderAuthProvider[];

export type AuthProvider = (typeof authProviders)[number];

export const authIntegrationCredential = z.discriminatedUnion("providerId", [
	googleDriveAuth.configurationSchema,
	notionAuth.configurationSchema,
	googleGmailAuth.configurationSchema,
]);

export type AuthIntegrationCredential = z.infer<typeof authIntegrationCredential>;

export const authIntegrationAuthSessionContext = z.object({
	context: z.object({
		workspaceId: z.string().uuid(),
		endUserId: z.string().uuid(),
		integrationId: z.string().uuid(),
		portalSessionId: z.string().uuid(),
	}),
});

export type AuthIntegrationAuthSessionContext = z.infer<typeof authIntegrationAuthSessionContext>;

export const authIntegrationAuthSession = z.discriminatedUnion("providerId", [
	googleDriveAuth.authSessionSchema.merge(authIntegrationAuthSessionContext),
	notionAuth.authSessionSchema.merge(authIntegrationAuthSessionContext),
	googleGmailAuth.authSessionSchema.merge(authIntegrationAuthSessionContext),
]);

export type AuthIntegrationAuthSession = z.infer<typeof authIntegrationAuthSession>;

export const authIntegrationCredentials = z.discriminatedUnion("providerId", [
	googleDriveAuth.credentialsSchema,
	notionAuth.credentialsSchema,
	googleGmailAuth.credentialsSchema,
]);

export type AuthIntegrationCredentials = z.infer<typeof authIntegrationCredentials>;

export const getAuthProvider = (providerIdentifier: string) => {
	const provider = authProviders.find((provider) => provider.owns(providerIdentifier));

	if (!provider) {
		throw new Error(`Provider ${providerIdentifier} not found`);
	}

	return provider;
};
