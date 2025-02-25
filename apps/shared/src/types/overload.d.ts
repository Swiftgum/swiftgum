import type { AuthIntegrationCredential, AuthIntegrationCredentials } from "@/providers/auth";
import type {
	AuthSession as AuthSessionPayload,
	Destination,
	PortalSessionConfiguration,
	ProviderMetadata,
} from "../interfaces";
import type { Database } from "./database-server";

export type DecryptedDestination = Omit<
	Database["private"]["Views"]["destinations_with_decrypted_params"]["Row"],
	"decrypted_destination_params"
> & {
	decrypted_destination_params: Destination;
};

export type DecryptedIntegration = Omit<
	Database["private"]["Views"]["integrations_with_decrypted_credentials"]["Row"],
	"decrypted_credentials"
> & {
	decrypted_credentials: AuthIntegrationCredential;
};

export type PortalSession = Database["private"]["Tables"]["portal_sessions"]["Row"] & {
	configuration: PortalSessionConfiguration;
};

export type Provider = Database["public"]["Tables"]["providers"]["Row"] & {
	metadata: ProviderMetadata;
};

export type Integration = Database["public"]["Tables"]["integrations"]["Row"];

export type Token = Database["private"]["Tables"]["tokens"]["Row"];

export type DecryptedToken = Omit<Token, "decrypted_tokenset"> & {
	decrypted_tokenset: AuthIntegrationCredentials;
};

export type AuthSession = Omit<
	Database["private"]["Tables"]["auth_sessions"]["Row"],
	"auth_session"
> & {
	auth_session: AuthSessionPayload;
};
