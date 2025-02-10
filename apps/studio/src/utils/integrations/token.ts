/**
 * Utils to handle integration tokens
 */

import { createClient } from "@/utils/supabase/server";
import type { Database } from "@/utils/supabase/types";

import { z } from "zod";

export const Oauth2Tokenset = z.object({
	type: z.literal("oauth2"),
	oauth2: z.object({
		access_token: z.string(),
		refresh_token: z.string(),
		expires_in: z.number().optional(),
		expires_at: z.string().optional(),
		scope: z.string(),
	}),
});

export type Oauth2Tokenset = z.infer<typeof Oauth2Tokenset>;

const TokenSet = z.discriminatedUnion("type", [Oauth2Tokenset]);

export type TokenSet = z.infer<typeof TokenSet>;

export type DecryptedTokenRow = Omit<
	Database["public"]["Views"]["tokens_with_decrypted_tokenset"]["Row"],
	"decrypted_tokenset"
> & {
	decrypted_tokenset: TokenSet;
};

/**
 * Save a set of tokens to the database
 */
export const saveIntegrationToken = async ({
	tokenset,
	...token
}: Omit<Database["public"]["Tables"]["tokens"]["Insert"], "encrypted_tokenset" | "workspace_id"> & {
	tokenset: TokenSet;
}) => {
	const parsedTokenSet = TokenSet.parse(tokenset);

	const supabase = await createClient();

	const { data: integration, error: integrationError } = await supabase
		.from("integrations")
		.select("*")
		.eq("integration_id", token.integration_id)
		.single();

	if (integrationError) throw integrationError;
	if (!integration) throw new Error("Integration not found");

	const encryptedTokenSet = await supabase.rpc("encrypt_tokenset", {
		p_workspace_id: integration.workspace_id,
		p_tokenset: parsedTokenSet,
	});

	if (encryptedTokenSet.error) throw encryptedTokenSet.error;

	const { data, error } = await supabase
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
