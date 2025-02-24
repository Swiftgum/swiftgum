import { z } from "zod";
import type { integrationCredentials } from "./integration";

const baseProviderMetadata = z.object({
	logo: z.string(),
});

const oauth2ProviderMetadata = baseProviderMetadata.extend({
	type: z.literal("oauth2"),
	oauth2: z.object({
		url: z.string(),
	}),
});

export const providerMetadata = z.discriminatedUnion("type", [oauth2ProviderMetadata]);

// Check that the providerMetadata.type is strictly equal to the integrationCredentials.type
type ProviderMetadata = z.infer<typeof providerMetadata>;
type IntegrationCredentials = z.infer<typeof integrationCredentials>;

// Safeguard against type mismatch
const _a: ProviderMetadata["type"] = "oauth2" satisfies ProviderMetadata["type"];
const _b: IntegrationCredentials["type"] = "oauth2" satisfies IntegrationCredentials["type"];
