import { z } from "zod";

export const oauth2Tokenset = z.object({
	type: z.literal("oauth2"),
	oauth2: z.object({
		access_token: z.string(),
		refresh_token: z.string(),
		expires_in: z.number().optional(),
		expires_at: z.string().optional(),
		scope: z.string(),
	}),
});

export type Oauth2Tokenset = z.infer<typeof oauth2Tokenset>;

export const tokenSet = z.discriminatedUnion("type", [oauth2Tokenset]);

export type TokenSet = z.infer<typeof tokenSet>;
