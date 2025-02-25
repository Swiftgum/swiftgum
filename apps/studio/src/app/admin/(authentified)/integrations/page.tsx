import { PageHeader, PageShell } from "@/components/admin/shell";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { Metadata } from "next";
import { listIntegrations } from "./actions";
import { IntegrationForm } from "./integration-form";

export const metadata: Metadata = {
	title: "Integrations - Swiftgum Studio",
};

export default async function IntegrationsPage() {
	const integrations = await listIntegrations();

	return (
		<PageShell>
			<PageHeader
				title="Integrations"
				description="Manage your integrations and connected services"
			/>

			<Accordion type="single" collapsible className="w-full space-y-4">
				{integrations.map(({ provider, integration, authProviderSchemaShape }) => {
					return (
						<AccordionItem
							key={provider.provider_id}
							value={provider.provider_id}
							className="border rounded-lg bg-white shadow-sm overflow-hidden"
						>
							<AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
								<div className="flex items-start w-full gap-6">
									<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center pt-1">
										<img
											className="max-h-full max-w-full"
											src={provider.metadata?.logo as string}
											alt={provider.name}
										/>
									</div>
									<div className="flex-grow">
										<div className="flex items-center gap-3">
											<h3 className="font-medium text-zinc-700">{provider.name}</h3>
											<span
												className={`px-2 py-1 text-xs rounded-full ${
													integration?.enabled
														? "bg-green-100 text-green-700"
														: "bg-gray-100 text-gray-700"
												}`}
											>
												{integration?.enabled ? "Enabled" : "Not Connected"}
											</span>
										</div>
										<p className="text-left text-sm text-gray-500 mt-1">{provider.description}</p>
									</div>
								</div>
							</AccordionTrigger>

							<AccordionContent>
								<div className="px-6 py-4 border-t">
									<IntegrationForm
										provider={provider}
										integration={integration}
										authProviderSchemaShape={authProviderSchemaShape}
									/>
								</div>
							</AccordionContent>
						</AccordionItem>
					);
				})}
			</Accordion>
		</PageShell>
	);
}
