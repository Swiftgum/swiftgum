/**
 * Utils to handle integration sign in sessions
 */
import { AuthSession, integrationCredentials } from "@knowledgex/shared/interfaces";
import type { Database } from "@knowledgex/shared/types/database";
import { createClient } from "../supabase/server";

export const getIntegrationCredentials = async (integrationId: string) => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("integrations_with_decrypted_credentials")
		.select("*")
		.eq("integration_id", integrationId)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Integration not found");

	return integrationCredentials.parse(data.decrypted_credentials);
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
