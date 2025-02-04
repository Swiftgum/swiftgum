import NotionIcon from "@/components/Icons/notionIcon";
import { createClient } from "@/utils/supabase/server";
import { faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

import { getURL } from "@/utils/helpers";
import { redirect } from "next/navigation";
import OAuthProvider from "./oauthprovider";

export default async function Providers() {
	const supabase = await createClient();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (!user || authError) redirect("/signin");

	// Fetch workspace info
	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace") // Replace with your actual table name
		.select("workspace_id")
		.eq("owner_user_id", user.id) // Assuming you have a user_id field in the workspaces table
		.single();

	if (!workspace) {
		throw new Error("No workspace found");
	}

	// Fetch providers
	const { data: providers, error: providersError } = await supabase.from("providers").select("*");

	// Fetch integrations associated with the user's workspace
	const { data: integrations, error: integrationsError } = await supabase
		.from("integrations_with_decrypted_credentials")
		.select("*")
		.eq("workspace_id", workspace.workspace_id); // Assuming workspace_id links to the user's workspace

	if (workspaceError || providersError || integrationsError) {
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
				const integration = integrations.find(
					(integration) => integration.provider_id === provider.provider_id,
				);
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
