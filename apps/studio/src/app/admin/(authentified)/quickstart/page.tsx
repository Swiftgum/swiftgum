import { PageHeader, PageShell } from "@/components/admin/shell";
import { Card } from "@/components/ui/card";
import type { Metadata } from "next";
import { QuickstartSteps } from "./components";

export const metadata: Metadata = {
	title: "Quickstart - Swiftgum Studio",
};

export default async function QuickstartPage() {
	return (
		<PageShell>
			<PageHeader
				title="Quickstart Guide"
				description="Follow these steps to get started with Swiftgum"
			/>

			<div className="space-y-6">
				<Card className="p-6">
					<QuickstartSteps />
				</Card>
			</div>
		</PageShell>
	);
}
