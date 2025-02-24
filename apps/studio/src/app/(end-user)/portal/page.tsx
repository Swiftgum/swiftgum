import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { getPagePortalSession } from "@/utils/portal/session";
import { createServerOnlyClient } from "@/utils/supabase/server";
import type { Provider } from "@knowledgex/shared/types/overload";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import React from "react";
import OAuthProvider from "./oauthprovider";

const LegalInformation = ({
	session,
}: { session: Awaited<ReturnType<typeof getPagePortalSession>>["session"] }) => {
	// TODO: add links to the legal information
	return (
		<div>
			<p className="text-xs md:text-sm text-gray-500 animate-in slide-in-from-bottom">
				{session.workspace.app_name || "App"} uses Swiftgum for its data processing services.
				<br />
				<span className="text-blue-600 font-medium hover:underline">Terms of Service</span>
				{" | "}
				<span className="text-blue-600 font-medium hover:underline">Privacy Policy</span>
				{" | "}
				<a className="text-blue-600 font-medium hover:underline" href="mailto:contact@swiftgum.com">
					Something is wrong?
				</a>
			</p>
		</div>
	);
};

export const metadata: Metadata = {
	title: "Portal - Swiftgum Studio",
};

export default async function PortalPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const supabase = await createServerOnlyClient();
	const sessionData = await getPagePortalSession({ searchParams });

	if (!sessionData?.session) {
		console.error("No session found");
		redirect("/error");
	}

	const session = sessionData.session;

	// Token user
	const { data: tokensEndUser, error: tokenEndUserError } = await supabase
		.schema("private")
		.from("tokens")
		.select("*")
		.eq("end_user_id", session.end_user_id);

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
		.select("*")
		.eq("workspace_id", session.workspace_id)
		.eq("enabled", true);

	if (integrationsError) {
		console.error("Failed to fetch integrations:", integrationsError);
		redirect("/error");
	}

	const userActiveIntegrations = integrations.filter((integration) =>
		tokensEndUser.find((token) => token.integration_id === integration.integration_id),
	);

	const userInactiveIntegrations = integrations.filter(
		(integration) => !userActiveIntegrations.includes(integration),
	);

	return (
		<>
			<div className="min-h-[100svh] lg:h-screen lg:overflow-hidden flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-2">
				<div className="bg-gray-100 flex flex-col gap-8 p-4 md:px-12 lg:py-12 items-start">
					<Button variant="ghost" size="sm" asChild className="animate-in slide-in-from-top">
						<a href={session.configuration.returnUrl}>
							<ArrowLeft className="w-4 h-4" />
							Return to {session.workspace.app_name || "App"}
						</a>
					</Button>
				</div>
				<div className="grow shrink-0 lg:shadow-xl shadow-black/10 col-span-2 xl:col-span-1 flex flex-col lg:outline outline-[1px] outline-black/5 overflow-auto">
					<div className="max-w-screen-sm flex flex-col justify-between px-6 md:px-12 py-6 md:py-12 gap-6 md:gap-12 min-h-full grow shrink-0">
						<div>
							<span className="text-gray-800 text-sm border border-gray-600 rounded-full px-3 py-1.5 font-medium animate-in slide-in-from-top inline-block">
								{session.configuration.userDisplay}
							</span>
						</div>
						<div className="flex flex-col gap-8 justify-center animate-in slide-in-from-bottom fade-in">
							{session.workspace.app_icon && (
								<div>
									<img
										src={session.workspace.app_icon}
										alt={session.workspace.app_name || "App logo"}
										className="h-12 aspect-square"
									/>
								</div>
							)}
							<h1 className="text-4xl font-extrabold tracking-tighter text-balance">
								Connect your data to {session.workspace.app_name || "App"}
							</h1>
							<p className="text-gray-500 text-lg text-balance leading-tight">
								{session.workspace.app_name || "This app"} will only be able to access data from
								integrations you have enabled.
							</p>

							<Accordion
								type="single"
								defaultValue={userInactiveIntegrations.length > 0 ? "inactive" : undefined}
							>
								{userInactiveIntegrations.length > 0 && (
									<AccordionItem value="inactive">
										<AccordionTrigger>Suggested Integrations</AccordionTrigger>
										<AccordionContent xPad>
											<div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] py-2 gap-2 md:gap-4">
												{userInactiveIntegrations?.map((integration) => {
													const provider = providers?.find(
														(p) => p.provider_id === integration.provider_id,
													) as Provider;

													const token = tokensEndUser?.find(
														(tokenEndUser) =>
															tokenEndUser.integration_id === integration.integration_id,
													);

													return provider ? (
														<OAuthProvider
															key={integration.integration_id}
															integration={integration}
															provider={provider}
															portalSession={sessionData.session}
															token={token}
														/>
													) : null;
												})}
											</div>
										</AccordionContent>
									</AccordionItem>
								)}
								{userActiveIntegrations.length > 0 && (
									<AccordionItem value="active" className="border-b-0 group">
										<AccordionTrigger>
											<div className="flex items-center gap-3">
												<span className="relative w-2 h-2">
													<span className="w-2 h-2 rounded-full bg-green-500 animate-ping absolute block top-0 left-0" />
													<span className="block w-2 h-2 rounded-full bg-green-500" />
												</span>
												Active Integrations{userActiveIntegrations.length > 1 ? "s" : ""}
												<div className="flex items-center gap-2 group-data-[state=open]:opacity-0">
													{userActiveIntegrations.map((integration) => {
														const provider = providers?.find(
															(p) => p.provider_id === integration.provider_id,
														);

														return provider ? (
															<img
																key={integration.integration_id}
																// biome-ignore lint/suspicious/noExplicitAny: <explanation>
																src={(provider.metadata as any).logo as string}
																alt={provider.name}
																className="h-4"
															/>
														) : null;
													})}
												</div>
											</div>
										</AccordionTrigger>
										<AccordionContent xPad>
											<div className="grid py-2 grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 md:gap-4">
												{userActiveIntegrations?.map((integration) => {
													const provider = providers?.find(
														(p) => p.provider_id === integration.provider_id,
													) as Provider;

													const token = tokensEndUser?.find(
														(tokenEndUser) =>
															tokenEndUser.integration_id === integration.integration_id,
													);

													return provider ? (
														<OAuthProvider
															key={integration.integration_id}
															integration={integration}
															provider={provider}
															portalSession={sessionData.session}
															token={token}
														/>
													) : null;
												})}
											</div>
										</AccordionContent>
									</AccordionItem>
								)}
							</Accordion>
							<Button size="lg" asChild>
								<a href={session.configuration.returnUrl}>
									Sync with {session.workspace.app_name || "App"}
									<ArrowRight className="w-4 h-4" />
								</a>
							</Button>
						</div>
						<LegalInformation session={session} />
					</div>
				</div>
			</div>
		</>
	);
}
