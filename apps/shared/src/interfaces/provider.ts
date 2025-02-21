import { z } from "zod";
import type { integrationCredentials } from "./integration";

export const providerMetadata = z.object({
	logo: z.string(),
	type: z.enum(["oauth2"]),
});

// Check that the providerMetadata.type is strictly equal to the integrationCredentials.type
type ProviderMetadata = z.infer<typeof providerMetadata>;
type IntegrationCredentials = z.infer<typeof integrationCredentials>;

// Safeguard against type mismatch
const _a: ProviderMetadata["type"] = "oauth2" satisfies ProviderMetadata["type"];
const _b: IntegrationCredentials["type"] = "oauth2" satisfies IntegrationCredentials["type"];
