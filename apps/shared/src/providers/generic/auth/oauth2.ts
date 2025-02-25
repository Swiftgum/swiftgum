import * as client from "openid-client";
import { z } from "zod";
import { providerAuth } from ".";

const oauth2ProviderBaseParams = z.object({
	providerId: z.string(),
	scope: z.string().optional(),
	tokenEndpointAuthMethod: z.enum(["client_secret_post", "client_secret_basic"]).optional(),
});

const oauth2DirectProviderParams = oauth2ProviderBaseParams.extend({
	method: z.literal("direct"),
	authorizationUrl: z.string(),
	tokenUrl: z.string(),
	issuer: z.string().optional(),
});

const oauth2IssuerProviderParams = oauth2ProviderBaseParams.extend({
	method: z.literal("issuer"),
	issuer: z.string(),
});

const oauth2ProviderParams = z.discriminatedUnion("method", [
	oauth2DirectProviderParams,
	oauth2IssuerProviderParams,
]);

const oauth2ConfigurationSchema = z
	.object({
		clientId: z.string().describe("Client ID").min(1),
		clientSecret: z.string().describe("@secret Client Secret").min(1),
	})
	.describe("OAuth2 Configuration");

const oauth2AuthSessionSchema = z.object({
	pkceCodeVerifier: z.string(),
	state: z.string(),
});

const oauth2CredentialsSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string().optional(),
});

const buildOauth2Config = async ({
	providerConfig,
	configuration,
}: {
	providerConfig: z.infer<typeof oauth2ProviderParams>;
	configuration: z.infer<typeof oauth2ConfigurationSchema>;
}) => {
	const clientSecretProvider =
		providerConfig.tokenEndpointAuthMethod === "client_secret_basic"
			? client.ClientSecretBasic
			: providerConfig.tokenEndpointAuthMethod === "client_secret_post"
				? client.ClientSecretPost
				: undefined;

	if (providerConfig.method === "direct") {
		return new client.Configuration(
			{
				authorization_endpoint: providerConfig.authorizationUrl,
				token_endpoint: providerConfig.tokenUrl,
				issuer: providerConfig.issuer,
			},
			configuration.clientId,
			undefined,
			clientSecretProvider(configuration.clientSecret),
		);
	}

	return await client.discovery(
		new URL(providerConfig.issuer),
		configuration.clientId,
		typeof clientSecretProvider === "undefined" ? configuration.clientSecret : undefined,
		typeof clientSecretProvider === "undefined"
			? undefined
			: clientSecretProvider(configuration.clientSecret),
	);
};

export const oauth2ProviderAuth = <ProviderID extends string>(
	unsafeProviderConfig: z.infer<typeof oauth2ProviderParams>,
) => {
	const providerConfig = oauth2ProviderParams.parse(unsafeProviderConfig);

	return providerAuth<
		ProviderID,
		typeof oauth2ConfigurationSchema,
		typeof oauth2AuthSessionSchema,
		typeof oauth2CredentialsSchema
	>({
		providerId: providerConfig.providerId as ProviderID,

		configurationSchema: oauth2ConfigurationSchema,
		authSessionSchema: oauth2AuthSessionSchema,
		credentialsSchema: oauth2CredentialsSchema,

		initiate: async ({ configuration, callbackUrl, sessionId }) => {
			const config = await buildOauth2Config({
				providerConfig,
				configuration,
			});

			// Generate PKCE code verifier and challenge
			const codeVerifier = client.randomPKCECodeVerifier();
			const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

			// Build the authorization URL
			const redirectUrl = client.buildAuthorizationUrl(config, {
				code_challenge: codeChallenge,
				scope: providerConfig.scope,
				redirect_uri: callbackUrl.toString(),
				state: sessionId,
				code_challenge_method: "S256",
				access_type: "offline",
				prompt: "consent",
			});

			return {
				session: {
					pkceCodeVerifier: codeVerifier,
					state: sessionId,
				},
				nextUrl: new URL(redirectUrl),
			};
		},
		callback: async ({ configuration, authSession, request }) => {
			const config = await buildOauth2Config({
				providerConfig,
				configuration,
			});

			console.log({ providerConfig, configuration, authSession, config });

			const tokenSet = await client.authorizationCodeGrant(config, request, {
				pkceCodeVerifier: authSession.pkceCodeVerifier,
				expectedState: authSession.state,
			});

			return {
				credentials: {
					accessToken: tokenSet.access_token,
					refreshToken: tokenSet.refresh_token,
				},
			};
		},
	});
};
