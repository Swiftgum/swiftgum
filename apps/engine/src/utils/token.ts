import * as client from "openid-client";
import type { DecryptedIntegrationCredentials } from "../../../studio/src/utils/integrations/session";
import type { DecryptedTokenRow, TokenSet } from "../../../studio/src/utils/integrations/token";
import { sql } from "../db";

/**
 * Duration in milliseconds which will trigger a token refresh.
 */
const AUTO_REFRESH_THRESHOLD = 10 * 60 * 1000; // 10 minutes

export const getTokenFromDB = async ({ tokenId }: { tokenId: string }) => {
	const token = await sql`
    SELECT * FROM tokens_with_decrypted_tokenset
    WHERE token_id = ${tokenId}
  `;

	if (!token) {
		throw new Error("Token not found");
	}

	return token[0] as DecryptedTokenRow;
};

export const getIntegrationFromDB = async ({ integrationId }: { integrationId: string }) => {
	const integration = await sql`
    SELECT * FROM integrations_with_decrypted_credentials
    WHERE integration_id = ${integrationId}
  `;

	if (!integration) {
		throw new Error("Integration not found");
	}

	return integration[0] as DecryptedIntegrationCredentials;
};

const refreshTokenInDB = async ({
	token,
}: {
	token: DecryptedTokenRow;
}) => {
	const clientConfig = await getIntegrationFromDB({ integrationId: token.integration_id });

	const config = await client.discovery(
		new URL(clientConfig.decrypted_credentials.oauth2.url),
		clientConfig.decrypted_credentials.oauth2.client_id,
		clientConfig.decrypted_credentials.oauth2.client_secret,
	);

	const tokens = await client.refreshTokenGrant(
		config,
		token.decrypted_tokenset.oauth2.refresh_token,
	);

	if (tokens.access_token) {
		const newTokenSet = {
			type: "oauth2",
			oauth2: {
				...token.decrypted_tokenset.oauth2,
				access_token: tokens.access_token,
			},
		} satisfies TokenSet;

		const encryptedToken = await sql`
      SELECT * FROM encrypt_tokenset(
        p_workspace_id => ${clientConfig.workspace_id},
        p_tokenset => ${sql.json(newTokenSet)}
      )
    `;

		if (!encryptedToken[0]) {
			throw new Error("Failed to encrypt token set");
		}

		const expiresAt = tokens.expires_in
			? new Date(Date.now() + tokens.expires_in * 1000)
			: new Date();

		const updatedToken = await sql`
      UPDATE tokens
      SET encrypted_tokenset = ${encryptedToken[0].encrypt_tokenset}, refreshed_at = (now() at time zone 'utc'), expires_at = ${expiresAt}
      WHERE token_id = ${token.token_id}
      RETURNING *
    `;

		if (!updatedToken[0]) {
			throw new Error("Failed to update token");
		}

		return updatedToken[0] as DecryptedTokenRow;
	}

	return token;
};

export const getToken = async ({ tokenId }: { tokenId: string }) => {
	let token = await getTokenFromDB({ tokenId });

	if (token.expires_at < new Date(Date.now() + AUTO_REFRESH_THRESHOLD)) {
		token = await refreshTokenInDB({ token });
	}

	return token;
};
