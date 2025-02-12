import { z } from "zod";

export const GenericAuthSession = z.object({
	redirect: z.string().optional(),
	portal_session_id: z.string(),
	scope: z.string(),
});

export type GenericAuthSession = z.infer<typeof GenericAuthSession>;

export const Oauth2AuthSession = z
	.object({
		type: z.literal("oauth2"),
		oauth2: z.object({
			pkce_code_verifier: z.string(),
		}),
	})
	.merge(GenericAuthSession);

export type Oauth2AuthSession = z.infer<typeof Oauth2AuthSession>;

export const AuthSession = z.discriminatedUnion("type", [Oauth2AuthSession]);

export type AuthSession = z.infer<typeof AuthSession>;
