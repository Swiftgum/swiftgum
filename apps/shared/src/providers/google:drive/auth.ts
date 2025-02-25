import { oauth2ProviderAuth } from "../generic/auth/oauth2";

export const googleDriveAuth = oauth2ProviderAuth<"google:drive">({
	providerId: "google:drive",
	method: "issuer",
	issuer: "https://accounts.google.com/.well-known/openid-configuration",
	scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
});
