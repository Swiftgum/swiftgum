"use server";

import { log } from "@/utils/log";
import {
	type AuthIntegrationAuthSession,
	authIntegrationAuthSession,
	authIntegrationCredential,
} from "@knowledgex/shared/providers/auth";
import type { Database } from "@knowledgex/shared/types/database-server";
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

	const { data: provider, error: providerError } = await supabase
		.schema("public")
		.from("providers")
		.select("*")
		.eq("provider_id", data.provider_id as unknown as string)
		.single();

	if (providerError) throw providerError;
	if (!provider) throw new Error("Provider not found");

	return {
		integrationCredentials: authIntegrationCredential.parse(data.decrypted_credentials),
		provider,
	};
};

export const createAuthSession = async (
	authSession: Omit<Database["private"]["Tables"]["auth_sessions"]["Insert"], "auth_session"> & {
		auth_session: AuthIntegrationAuthSession;
	},
) => {
	console.log(authSession.auth_session);

	// Verify with zod
	const parsedAuthSession = authIntegrationAuthSession.parse(authSession.auth_session);

	console.log(authSession);

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
		workspace_id: parsedAuthSession.context.workspaceId,
		end_user_id: data.end_user_id,
		level: "info",
		type: "portal-auth-session",
		name: "created",
		id: {
			auth_session: data.auth_session_id,
			portal_session: parsedAuthSession.context.portalSessionId,
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

	console.log(data.auth_session);

	const safeData = authIntegrationAuthSession.parse(data.auth_session);

	void log({
		workspace_id: safeData.context.workspaceId,
		end_user_id: safeData.context.endUserId,
		level: "info",
		type: "portal-auth-session",
		name: "claimed",
		id: {
			auth_session: data.auth_session_id as unknown as string,
			portal_session: safeData.context.portalSessionId,
			integration: safeData.context.integrationId,
			end_user: safeData.context.endUserId,
		},
	});

	return {
		...data,
		auth_session: authIntegrationAuthSession.parse(data.auth_session),
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

	const safeData = authIntegrationAuthSession.parse(data.auth_session);

	void log({
		workspace_id: safeData.context.workspaceId,
		end_user_id: data.end_user_id,
		level: "warning",
		type: "portal-auth-session",
		name: "ghost-claimed",
		id: {
			auth_session: data.auth_session_id,
			portal_session: safeData.context.portalSessionId,
			integration: safeData.context.integrationId,
			end_user: safeData.context.endUserId,
		},
	});

	return {
		...data,
		auth_session: authIntegrationAuthSession.parse(data.auth_session),
	};
};
