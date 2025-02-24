import { PageHeader, PageShell } from "@/components/admin/shell";
import type { Metadata } from "next";
import { listDestinations } from "./actions";
import { DestinationForm } from "./destination-form";

export const metadata: Metadata = {
	title: "Destinations - Swiftgum Studio",
};

export default async function DestinationPage() {
	const destinations = await listDestinations();

	return (
		<PageShell>
			<PageHeader
				title="Webhook Destination"
				description="Configure and manage webhook endpoints for seamless data delivery"
			/>
			<div className="mt-8">
				<DestinationForm destinations={destinations} />
			</div>
		</PageShell>
	);
}
