import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { type PortalSession, getPagePortalSession } from "@/utils/portal/session";
import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";
import OAuthProvider from "./oauthprovider";

const LegalInformation = ({ session }: { session: PortalSession }) => {
	// TODO: add links to the legal information

	return (
		<div>
			<p className="text-sm text-gray-500 animate-in slide-in-from-bottom">
				{session.configuration.appName} uses KnowledgeX for its data processing services.
				<br />
				<span className="text-blue-600 font-medium hover:underline">Terms of Service</span>
				{" | "}
				<span className="text-blue-600 font-medium hover:underline">Privacy Policy</span>
				{" | "}
				<a
					className="text-blue-600 font-medium hover:underline"
					href="mailto:contact@knowledgex.com"
				>
					Something is wrong?
				</a>
			</p>
		</div>
	);
};

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
			<div className="min-h-screen flex flex-col lg:grid lg:grid-cols-3 xl:grid-cols-2">
				<div className="bg-gray-100 flex flex-col gap-8 p-4 md:px-12 lg:py-12 items-start">
					<Button variant="ghost" size="sm" asChild className="animate-in slide-in-from-top">
						<a href={session.configuration.returnUrl}>
							<ArrowLeft className="w-4 h-4" />
							Return to {session.configuration.appName}
						</a>
					</Button>
				</div>
				<div className="grow shrink-0 lg:overflow-y-scroll lg:shadow-xl shadow-black/10 col-span-2 xl:col-span-1">
					<div className="max-w-screen-sm flex flex-col justify-between px-6 md:px-12 py-6 md:py-12 gap-6 md:gap-12 min-h-full">
						<div>
							<span className="text-gray-800 text-sm border border-gray-600 rounded-full px-3 py-1.5 font-medium animate-in slide-in-from-top inline-block">
								{session.configuration.userDisplay}
							</span>
						</div>
						<div className="flex flex-col gap-8 justify-center animate-in slide-in-from-bottom fade-in">
							<h1 className="text-4xl font-extrabold tracking-tighter text-balance">
								Connect your data to {session.configuration.appName}
							</h1>
							<p className="text-gray-500 text-lg text-balance leading-tight">
								{session.configuration.appName} will only be able to access data from integrations
								you have enabled.
							</p>

							<Accordion type="single" defaultValue={"inactive"}>
								<AccordionItem value="inactive">
									<AccordionTrigger>Suggested Integrations</AccordionTrigger>
									<AccordionContent>
										<div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 md:gap-4">
											{userInactiveIntegrations?.map((integration) => {
												const provider = providers?.find(
													(p) => p.provider_id === integration.provider_id,
												);

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
								{userActiveIntegrations.length > 0 && (
									<AccordionItem value="active" className="border-b-0">
										<AccordionTrigger>
											<div className="flex items-center gap-2">
												<span className="flex items-center gap-2 pl-2 pr-3 py-0.5 font-bold bg-green-500 text-white rounded-full">
													<Check className="w-5 h-5" />
													<span className="block">{userActiveIntegrations.length}</span>
												</span>
												Active Integration{userActiveIntegrations.length > 1 ? "s" : ""}
												<div className="flex items-center gap-2">
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
										<AccordionContent>
											<div className="grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 md:gap-4">
												{userActiveIntegrations?.map((integration) => {
													const provider = providers?.find(
														(p) => p.provider_id === integration.provider_id,
													);

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
								<a href={sessionData.session.configuration.returnUrl}>
									Done
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
