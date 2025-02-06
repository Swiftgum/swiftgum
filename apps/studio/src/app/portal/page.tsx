import NotionIcon from "@/components/Icons/notionIcon";
import { createClient } from "@/utils/supabase/server";
import { faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ReactNode } from "react";

import { getURL } from "@/utils/helpers";
import { redirect } from "next/navigation";
import OAuthProvider from "./oauthprovider";
// import OAuthProvider from "./oauthprovider";

export default async function PortalPage() {
	const supabase = await createClient();

	// MOCK DATA
	// NEED TO REPLACE: we have access to the workspace_id with the signed URL
	const workspaceId = "00000000-0000-0000-0000-000000000000";

	// Fetch providers
	const { data: providers, error: providersError } = await supabase.from("providers").select("*");
	console.log(providers);

	if (providersError) {
		console.log(providersError);
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
				<h1 className="text-2xl font-bold text-zinc-700">Manage Your Connected Accounts</h1>
				<p className="text-gray-600">
					Securely connect your accounts to different services, control access to your data
				</p>
			</div>
			<div className="flex flex-col gap-2">
				{providers.map((provider) => {
					return (
						<OAuthProvider
							key={provider.name}
							name={provider.name}
							providerId={provider.provider_id}
							workspaceId={workspaceId}
							icon={providerIcons[provider.identifier] || null}
							callbackUrl={`${baseURL}/portal/auth/callback`}
						/>
					);
				})}
			</div>
		</div>
	);
}
