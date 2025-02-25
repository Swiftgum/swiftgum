import * as client from "openid-client";
import { z } from "zod";
import { providerAuth } from ".";
const oauth2ProviderBaseParams = z.object({
	providerId: z.string(),
	scope: z.string().optional(),
	tokenEndpointAuthMethod: z
		.enum(["client_secret_post", "client_secret_basic", "client_secret_basic_unencoded"])
		.optional(),
	issuer: z.string(),
});

const oauth2DirectProviderParams = oauth2ProviderBaseParams.extend({
	method: z.literal("direct"),
	authorizationUrl: z.string(),
	tokenUrl: z.string(),
});

const oauth2IssuerProviderParams = oauth2ProviderBaseParams.extend({
	method: z.literal("issuer"),
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
	callbackUrl: z.string(),
});

const oauth2CredentialsSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string().optional(),
});

const ClientBasicSecretUnencoded = (clientSecret: string): client.ClientAuth => {
	return (_as, client, _body, headers) => {
		const username = client.client_id;
		const password = clientSecret;
		const credentials = btoa(`${username}:${password}`);
		headers.set("authorization", `Basic ${credentials}`);
	};
};

const buildOauth2Config = async ({
	providerConfig,
	configuration,
}: {
	providerConfig: z.infer<typeof oauth2ProviderParams>;
	configuration: z.infer<typeof oauth2ConfigurationSchema>;
}) => {
	let clientSecretProvider: ((clientSecret: string) => client.ClientAuth) | undefined = undefined;

	switch (providerConfig.tokenEndpointAuthMethod) {
		case "client_secret_basic":
			clientSecretProvider = client.ClientSecretBasic;
			break;
		case "client_secret_basic_unencoded":
			clientSecretProvider = ClientBasicSecretUnencoded;
			break;
		case "client_secret_post":
			clientSecretProvider = client.ClientSecretPost;
			break;
	}

	if (providerConfig.method === "direct") {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

		return new client.Configuration(
			{
				authorization_endpoint: providerConfig.authorizationUrl,
				token_endpoint: providerConfig.tokenUrl,
				issuer: providerConfig.issuer,
			},
			configuration.clientId,
			typeof clientSecretProvider === "undefined" ? configuration.clientSecret : undefined,
			typeof clientSecretProvider === "undefined"
				? undefined
				: clientSecretProvider(configuration.clientSecret),
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
				scope: providerConfig.scope ?? "",
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
					callbackUrl: callbackUrl.toString(),
				},
				nextUrl: new URL(redirectUrl),
			};
		},
		callback: async ({ configuration, authSession, request }) => {
			const config = await buildOauth2Config({
				providerConfig,
				configuration,
			});

			console.log({ providerConfig, configuration, authSession, config: config.serverMetadata() });

			const tokenSet = await client.authorizationCodeGrant(
				config,
				request,
				{
					pkceCodeVerifier: authSession.pkceCodeVerifier,
					expectedState: authSession.state,
				},
				{
					redirect_uri: authSession.callbackUrl,
				},
			);

			return {
				credentials: {
					accessToken: tokenSet.access_token,
					refreshToken: tokenSet.refresh_token,
				},
			};
		},
	});
};
