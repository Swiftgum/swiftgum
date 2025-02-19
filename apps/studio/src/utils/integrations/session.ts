"use server";

import { log } from "@/utils/log";
import {
	authSession as authSessionSchema,
	integrationCredentials,
} from "@knowledgex/shared/interfaces";
import type { Database } from "@knowledgex/shared/types/database-server";
import type { AuthSession } from "@knowledgex/shared/types/overload";
import { createServerOnlyClient } from "../supabase/server";

/**
 * Utils to handle integration sign in sessions
 */

export const getIntegrationCredentials = async (integrationId: string) => {
	const supabase = await createServerOnlyClient();

	const { data, error } = await supabase
		.schema("private")
		.from("integrations_with_decrypted_credentials")
		.select("*")
		.eq("integration_id", integrationId)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Integration not found");

	return integrationCredentials.parse(data.decrypted_credentials);
};

export const createAuthSession = async (
	authSession: Omit<Database["private"]["Tables"]["auth_sessions"]["Insert"], "auth_session"> & {
		auth_session: AuthSession["auth_session"];
	},
) => {
	// Verify with zod
	const parsedAuthSession = authSessionSchema.parse(authSession.auth_session);

	const supabase = await createServerOnlyClient();

	const { data, error } = await supabase
		.schema("private")
		.from("auth_sessions")
		.insert({
			...authSession,
			auth_session: parsedAuthSession,
		})
		.select("*")
		.single();

	if (error) throw error;

	void log({
		workspace_id: parsedAuthSession.workspace_id,
		end_user_id: data.end_user_id,
		level: "info",
		type: "portal-auth-session",
		name: "created",
		id: {
			auth_session: data.auth_session_id,
			portal_session: parsedAuthSession.portal_session_id,
			integration: authSession.integration_id,
			end_user: data.end_user_id,
		},
	});

	return data;
};

export const claimAuthSession = async (authSessionId: string) => {
	const supabase = await createServerOnlyClient();

	const { data, error } = await supabase
		.schema("private")
		.from("valid_auth_sessions")
		.update({ claimed_at: "now()" })
		.eq("auth_session_id", authSessionId)
		.select("*")
		.single();

	if (error) throw error;
	if (!data) throw new Error("Session not found");

	const safeData = data as AuthSession;

	void log({
		workspace_id: safeData.auth_session.workspace_id,
		end_user_id: safeData.end_user_id,
		level: "info",
		type: "portal-auth-session",
		name: "claimed",
		id: {
			auth_session: safeData.auth_session_id,
			portal_session: safeData.auth_session.portal_session_id,
			integration: safeData.integration_id,
			end_user: safeData.end_user_id,
		},
	});

	return {
		...safeData,
		auth_session: authSessionSchema.parse(data.auth_session),
	};
};

export const __dangerous__ghostClaimSession = async (authSessionId: string) => {
	const supabase = await createServerOnlyClient();

	const { data, error } = await supabase
		.schema("private")
		.from("auth_sessions")
		.select("*")
		.eq("auth_session_id", authSessionId)
		.single();

	if (error) throw error;
	if (!data) throw new Error("Session not found");

	const safeData = data as AuthSession;

	void log({
		workspace_id: safeData.auth_session.workspace_id,
		end_user_id: data.end_user_id,
		level: "warning",
		type: "portal-auth-session",
		name: "ghost-claimed",
		id: {
			auth_session: safeData.auth_session_id,
			portal_session: safeData.auth_session.portal_session_id,
			integration: safeData.integration_id,
			end_user: safeData.end_user_id,
		},
	});

	return {
		...data,
		auth_session: authSessionSchema.parse(data.auth_session),
	};
};
