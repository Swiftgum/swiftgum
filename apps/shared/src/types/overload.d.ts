import type {
	Destination,
	IntegrationCredentials,
	PortalSessionConfiguration,
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
