import React, { type ReactNode } from "react";
import NotionIcon from "@/components/Icons/notionIcon";
import { createClient } from "@/utils/supabase/server";
import { faGoogle, faMicrosoft } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getPagePortalSession } from "@/utils/portal/session";
import { getURL } from "@/utils/helpers";
import { redirect } from "next/navigation";
import OAuthProvider from "./oauthprovider";

export default async function PortalPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const supabase = await createClient();
	const sessionData = await getPagePortalSession({ searchParams });

	if (!sessionData?.session) {
		console.error("No session found");
		redirect("/error");
	}

	const session = sessionData.session;

	// Fetch end user
	const { data: endUser, error: endUserError } = await supabase
		.from("end_users")
		.select("*")
		.eq("end_user_id", session.end_user_id)
		.single();

	if (endUserError) {
		console.error("Failed to fetch end user:", endUserError);
		redirect("/error");
	}

	// Token user
	const { data: tokensEndUser, error: tokenEndUserError } = await supabase
		.from("tokens")
		.select("*")
		.eq("end_user_id", session.end_user_id);

	console.log(tokensEndUser, session.end_user_id);
	if (tokenEndUserError) {
		console.error("Failed to fetch tokens for end user:", tokenEndUserError);
		redirect("/error");
	}

	// Fetch providers
	const { data: providers, error: providersError } = await supabase.from("providers").select("*");
	if (providersError) {
		console.error("Failed to fetch providers:", providersError);
		redirect("/error");
	}

	// Fetch integrations
	const { data: integrations, error: integrationsError } = await supabase
		.from("integrations")
		.select("integration_id, provider_id")
		.eq("workspace_id", session.workspace_id)
		.eq("enabled", true);

	if (integrationsError) {
		console.error("Failed to fetch integrations:", integrationsError);
		redirect("/error");
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
					Securely connect your accounts to different services, control access to your data.
				</p>
				{endUser && <p className="text-xs italic text-zinc-700">{endUser.foreign_id}</p>}
			</div>

			<div className="flex flex-col gap-2">
				{integrations?.map((integration) => {
					const provider = providers?.find((p) => p.provider_id === integration.provider_id);
					const token = tokensEndUser?.find(
						(tokenEndUser) => tokenEndUser.integration_id === integration.integration_id,
					);
					return provider ? (
						<OAuthProvider
							key={provider.provider_id}
							name={provider.name}
							providerId={provider.provider_id}
							workspaceId={session.workspace_id}
							icon={providerIcons[provider.identifier] || null}
							token={token ? token.token_id : ""}
							integrationId={integration.integration_id}
							portalSessionId={session.portal_session_id}
						/>
					) : null;
				})}
			</div>
		</div>
	);
}
