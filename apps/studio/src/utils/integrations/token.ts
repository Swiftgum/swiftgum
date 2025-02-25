/**
 * Utils to handle integration tokens
 */

import { log } from "@/utils/log";
import { createServerOnlyClient } from "@/utils/supabase/server";
import {
	type AuthIntegrationCredentials,
	authIntegrationCredentials,
} from "@knowledgex/shared/providers/auth";
import type { Database } from "@knowledgex/shared/types/database-server";

/**
 * Save a set of tokens to the database
 */
export const saveIntegrationToken = async ({
	tokenset,
	...token
}: Omit<
	Database["private"]["Tables"]["tokens"]["Insert"],
	"encrypted_tokenset" | "workspace_id"
> & {
	tokenset: AuthIntegrationCredentials;
}) => {
	const parsedTokenSet = authIntegrationCredentials.parse(tokenset);

	const supabase = await createServerOnlyClient();

	const { data: integration, error: integrationError } = await supabase
		.from("integrations")
		.select("*")
		.eq("integration_id", token.integration_id)
		.single();

	if (integrationError) throw integrationError;
	if (!integration) throw new Error("Integration not found");

	// Check if a token already exists for this workspace and end user
	const { data: existingToken, error: existingTokenError } = await supabase
		.schema("private")
		.from("tokens")
		.select("*")
		.eq("workspace_id", integration.workspace_id)
		.eq("end_user_id", token.end_user_id)
		.single();

	if (existingTokenError && existingTokenError.code !== "PGRST116") {
		// PGRST116 is the error code for "no rows returned" which is expected if no token exists
		throw existingTokenError;
	}

	const encryptedTokenSet = await supabase.schema("private").rpc("encrypt_tokenset", {
		p_workspace_id: integration.workspace_id,
		p_tokenset: parsedTokenSet,
	});

	if (encryptedTokenSet.error) throw encryptedTokenSet.error;

	let data: Database["private"]["Tables"]["tokens"]["Row"] | null = null;
	let error: Error | null = null;

	if (existingToken) {
		// Update existing token
		const result = await supabase
			.schema("private")
			.from("tokens")
			.update({
				...token,
				workspace_id: integration.workspace_id,
				encrypted_tokenset: encryptedTokenSet.data,
			})
			.eq("token_id", existingToken.token_id)
			.select("*")
			.single();

		data = result.data;
		error = result.error;
	} else {
		// Insert new token
		const result = await supabase
			.schema("private")
			.from("tokens")
			.insert({
				...token,
				workspace_id: integration.workspace_id,
				encrypted_tokenset: encryptedTokenSet.data,
			})
			.select("*")
			.single();

		data = result.data;
		error = result.error;
	}

	if (error) throw error;
	if (!data) throw new Error("Token not found");

	void log({
		workspace_id: integration.workspace_id,
		end_user_id: token.end_user_id,
		level: "info",
		type: "token",
		name: existingToken ? "updated" : "created",
		metadata: {
			token_id: data.token_id,
			integration_id: token.integration_id,
		},
		id: {
			integration: token.integration_id,
			token: data.token_id,
			end_user: token.end_user_id,
		},
		private: false,
	});

	return data;
};
