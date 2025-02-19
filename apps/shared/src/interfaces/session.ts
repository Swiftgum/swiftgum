import { z } from "zod";

export const genericAuthSession = z.object({
	redirect: z.string(),
	portal_session_id: z.string().uuid(),
	scope: z.string(),
	workspace_id: z.string().uuid(),
});

export type GenericAuthSession = z.infer<typeof genericAuthSession>;

export const oauth2AuthSession = z
	.object({
		type: z.literal("oauth2"),
		oauth2: z.object({
			pkce_code_verifier: z.string(),
		}),
	})
	.merge(genericAuthSession);

export type Oauth2AuthSession = z.infer<typeof oauth2AuthSession>;

export const authSession = z.discriminatedUnion("type", [oauth2AuthSession]);

export type AuthSession = z.infer<typeof authSession>;
