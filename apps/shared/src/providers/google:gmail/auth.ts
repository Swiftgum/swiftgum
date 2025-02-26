import { oauth2ProviderAuth } from "../generic/auth/oauth2";

export const googleGmailAuth = oauth2ProviderAuth<"google:gmail">({
	providerId: "google:gmail",
	method: "issuer",
	issuer: "https://accounts.google.com/.well-known/openid-configuration",
	scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
});
