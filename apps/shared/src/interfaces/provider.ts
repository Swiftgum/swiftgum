import { z } from "zod";

export const providerMetadata = z.object({
	logo: z.string(),
});

export type ProviderMetadata = z.infer<typeof providerMetadata>;
