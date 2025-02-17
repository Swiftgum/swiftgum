import NotionIcon from "@/components/Icons/notionIcon";
import { createClient, createServerOnlyClient } from "@/utils/supabase/server";
import { faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

import { getURL } from "@/utils/helpers";
import { redirect } from "next/navigation";
import OAuthProvider from "./oauthprovider";
interface DecryptedCredentials {
	type: "oauth2";
	oauth2: {
		client_secret: string;
		client_id: string;
	};
}
export default async function Providers() {
	const supabase = await createClient();
	const supabaseServer = await createServerOnlyClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (!user || authError) redirect("/");

	// Fetch workspace info
	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace")
		.select("workspace_id")
		.eq("owner_user_id", user.id)
		.single();

	if (!workspace || workspaceError) {
		throw new Error("No workspace found");
	}

	// Fetch providers
	const { data: providers, error: providersError } = await supabase.from("providers").select("*");

	// Fetch integrations associated with the user's workspace
	const { data: integrations, error: integrationsError } = await supabaseServer
		.schema("private")
		.from("integrations_with_decrypted_credentials")
		.select("*")
		.eq("workspace_id", workspace.workspace_id); // Assuming workspace_id links to the user's workspace

	if (workspaceError || providersError || integrationsError) {
		console.log(workspaceError, providersError, integrationsError);
		throw new Error("Failed to fetch data");
	}

	const providerIcons: Record<string, ReactNode> = {
		Microsoft: <FontAwesomeIcon icon={faMicrosoft} className="w-5 h-5" />,
		"google:drive": <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />,
		"notion:notion": <NotionIcon className="w-5 h-5" />,
	};

	const baseURL = getURL();
	return (
		<div className="p-20">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Auth Providers</h1>
				<p className="text-gray-600">
					Authenticate your users through a suite of providers and login methods
				</p>
			</div>

			{providers.map((provider) => {
				const rawIntegration = integrations.find(
					(integration) => integration.provider_id === provider.provider_id,
				);

				// Ensure fields are never null and cast decrypted_credentials correctly
				const integration = rawIntegration
					? {
							integration_id: rawIntegration.integration_id ?? "",
							enabled: rawIntegration.enabled ?? false,
							decrypted_credentials: rawIntegration.decrypted_credentials
								? (rawIntegration.decrypted_credentials as unknown as DecryptedCredentials) // <-- FIX
								: null,
							created_at: rawIntegration.created_at ?? "",
							updated_at: rawIntegration.updated_at ?? "",
							workspace_id: rawIntegration.workspace_id ?? "",
							provider_id: rawIntegration.provider_id ?? "",
						}
					: null;

				return (
					<OAuthProvider
						key={provider.name}
						name={provider.name}
						providerId={provider.provider_id}
						workspaceId={workspace.workspace_id}
						icon={providerIcons[provider.identifier] || null}
						callbackUrl={`${baseURL}/portal/auth/callback`}
						integration={integration}
					/>
				);
			})}
		</div>
	);
}
