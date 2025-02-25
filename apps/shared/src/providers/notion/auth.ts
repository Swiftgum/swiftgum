import { oauth2ProviderAuth } from "../generic/auth/oauth2";

export const notionAuth = oauth2ProviderAuth<"notion">({
	providerId: "notion",
	method: "direct",
	authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
	tokenUrl: "https://api.notion.com/v1/oauth/token",
	tokenEndpointAuthMethod: "client_secret_basic_unencoded",
	issuer: "https://api.notion.com",
});
