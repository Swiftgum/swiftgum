import type {
	Destination,
	IntegrationCredentials,
	PortalSessionConfiguration,
	ProviderMetadata,
} from "../interfaces";
import type { Database } from "./database";

export type DecryptedDestination = Omit<
	Database["public"]["Views"]["destinations_with_decrypted_params"]["Row"],
	"decrypted_destination_params"
> & {
	decrypted_destination_params: Destination;
};

export type DecryptedIntegration = Omit<
	Database["public"]["Views"]["integrations_with_decrypted_credentials"]["Row"],
	"decrypted_credentials"
> & {
	decrypted_credentials: IntegrationCredentials;
};

export type PortalSession = Database["public"]["Tables"]["portal_sessions"]["Row"] & {
	configuration: PortalSessionConfiguration;
};

export type Provider = Database["public"]["Tables"]["providers"]["Row"] & {
	metadata: ProviderMetadata;
};

export type Integration = Database["public"]["Tables"]["integrations"]["Row"];

export type Token = Database["public"]["Tables"]["tokens"]["Row"];
