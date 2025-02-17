/**
 * Utils to handle integration tokens
 */

import { createClient } from "@/utils/supabase/server";
import { type TokenSet, tokenSet } from "@knowledgex/shared/interfaces";
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
	tokenset: TokenSet;
}) => {
	const parsedTokenSet = tokenSet.parse(tokenset);

	const supabase = await createClient();

	const { data: integration, error: integrationError } = await supabase
		.from("integrations")
		.select("*")
		.eq("integration_id", token.integration_id)
		.single();

	if (integrationError) throw integrationError;
	if (!integration) throw new Error("Integration not found");

	const encryptedTokenSet = await supabase.schema("private").rpc("encrypt_tokenset", {
		p_workspace_id: integration.workspace_id,
		p_tokenset: parsedTokenSet,
	});

	if (encryptedTokenSet.error) throw encryptedTokenSet.error;

	const { data, error } = await supabase
		.schema("private")
		.from("tokens")
		.insert({
			...token,
			workspace_id: integration.workspace_id,
			encrypted_tokenset: encryptedTokenSet.data,
		})
		.select("*")
		.single();

	if (error) throw error;

	return data;
};
