import { z } from "zod";

export const providerMetadata = z.object({
	logo: z.string(),
});

// Check that the providerMetadata.type is strictly equal to the integrationCredentials.type
export type ProviderMetadata = z.infer<typeof providerMetadata>;
