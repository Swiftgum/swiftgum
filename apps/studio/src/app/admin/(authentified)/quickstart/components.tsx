import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getEnabledIntegrations, hasDestination } from "./actions";

export async function QuickstartSteps() {
	const enabledIntegrations = await getEnabledIntegrations();
	const hasIntegrations = enabledIntegrations.length > 0;
	const destinationExists = await hasDestination();
	const canViewDocs = hasIntegrations && destinationExists;

	return (
		<div className="space-y-8">
			{/* Step 1: Get API Key */}
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
					<CheckCircle2 className="w-8 h-8 text-green-500" />
				</div>
				<div className="flex-grow space-y-2">
					<h3 className="text-lg font-medium text-zinc-700">Get your API key</h3>
					<p className="text-sm text-gray-500">
						View your API key to start using Swiftgum in your application.
					</p>
					<Button asChild className="mt-4">
						<Link href="/admin/api">
							View API Key
							<ChevronRight className="w-4 h-4 ml-1" />
						</Link>
					</Button>
				</div>
			</div>

			{/* Step 2: Enable Integrations */}
			<div className="flex items-start gap-4">
				<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
					{hasIntegrations ? (
						<CheckCircle2 className="w-8 h-8 text-green-500" />
					) : (
						<div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 font-medium">
							2
						</div>
					)}
				</div>
				<div className="flex-grow space-y-2">
					<h3 className="text-lg font-medium text-zinc-700">Enable integrations</h3>
					<p className="text-sm text-gray-500">
						{hasIntegrations
							? "You have enabled the following integrations:"
							: "Enable integrations to start connecting with external services."}
					</p>
					{hasIntegrations && (
						<div className="flex items-center gap-2 my-3">
							{enabledIntegrations.map((integration) => (
								<img
									key={integration.integration_id}
									src={integration.provider.metadata?.logo as string}
									alt={integration.provider.name}
									className="h-6 w-6 object-contain"
								/>
							))}
						</div>
					)}
					<Button asChild className="mt-4">
						<Link href="/admin/integrations">
							{hasIntegrations ? "Manage Integrations" : "Enable Integrations"}
							<ChevronRight className="w-4 h-4 ml-1" />
						</Link>
					</Button>
				</div>
			</div>

			{/* Step 3: Set up destination */}
			<div className={`flex items-start gap-4 ${!hasIntegrations ? "opacity-50" : ""}`}>
				<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
					{destinationExists ? (
						<CheckCircle2 className="w-8 h-8 text-green-500" />
					) : (
						<div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 font-medium">
							3
						</div>
					)}
				</div>
				<div className="flex-grow space-y-2">
					<h3 className="text-lg font-medium text-zinc-700">Set up a destination</h3>
					<p className="text-sm text-gray-500">
						{destinationExists
							? "Your destination is configured and ready to receive data."
							: "Configure where you want to receive your data."}
					</p>
					{hasIntegrations && (
						<Button asChild className="mt-4">
							<Link href="/admin/destination">
								{destinationExists ? "Manage Destination" : "Set up Destination"}
								<ChevronRight className="w-4 h-4 ml-1" />
							</Link>
						</Button>
					)}
				</div>
			</div>

			{/* Step 4: Check documentation */}
			<div className={`flex items-start gap-4 ${!canViewDocs ? "opacity-50" : ""}`}>
				<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
					<div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-500 font-medium">
						4
					</div>
				</div>
				<div className="flex-grow space-y-2">
					<h3 className="text-lg font-medium text-zinc-700">Check the documentation</h3>
					<p className="text-sm text-gray-500">
						Learn how to integrate Swiftgum into your application with our comprehensive
						documentation.
					</p>
					{canViewDocs && (
						<Button asChild variant="outline" className="mt-4">
							<a href="https://docs.swiftgum.com" target="_blank" rel="noopener noreferrer">
								View Documentation
								<ExternalLink className="w-4 h-4 ml-1" />
							</a>
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
