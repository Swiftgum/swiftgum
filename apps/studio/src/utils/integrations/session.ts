import type { Database } from "@/utils/supabase/types";
import { z } from "zod";
import { createClient } from "../supabase/server";

export const Oauth2IntegrationCredentials = z.object({
	type: z.literal("oauth2"),
	oauth2: z.object({
		url: z.string(),
		client_id: z.string(),
		client_secret: z.string(),
	}),
});

export type Oauth2IntegrationCredentials = z.infer<typeof Oauth2IntegrationCredentials>;

export const IntegrationCredentials = z.discriminatedUnion("type", [Oauth2IntegrationCredentials]);

export type IntegrationCredentials = z.infer<typeof IntegrationCredentials>;

export const GenericAuthSession = z.object({
	redirect: z.string().optional(),
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

export const getIntegrationCredentials = async (integrationId: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("integrations_with_decrypted_credentials")
		.select("*")
		.eq("integration_id", integrationId)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Integration not found");

	return IntegrationCredentials.parse(data.decrypted_credentials);
};

export const createAuthSession = async (
	authSession: Database["public"]["Tables"]["auth_sessions"]["Insert"] & {
		auth_session: AuthSession;
	},
) => {
	// Verify with zod
	const parsedAuthSession = AuthSession.parse(authSession.auth_session);

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("auth_sessions")
		.insert({
			...authSession,
			auth_session: parsedAuthSession,
		})
		.select("*")
		.single();

	if (error) throw error;

	return data;
};

export const claimAuthSession = async (authSessionId: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("valid_auth_sessions")
		.update({ claimed_at: "now()" })
		.eq("auth_session_id", authSessionId)
		.select("*")
		.single();

	if (error) throw error;
	if (!data) throw new Error("Session not found");

	return {
		...data,
		auth_session: AuthSession.parse(data.auth_session),
	};
};

export const __dangerous__ghostClaimSession = async (authSessionId: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("auth_sessions")
		.select("*")
		.eq("auth_session_id", authSessionId)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Session not found");

	return {
		...data,
		auth_session: AuthSession.parse(data.auth_session),
	};
};
