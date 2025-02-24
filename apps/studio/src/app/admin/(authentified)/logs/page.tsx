import type { Metadata } from "next";
import { AnalyticsTable } from "./table";

export const metadata: Metadata = {
	title: "Analytics & Logs - Swiftgum Studio",
};

export default async function AnalyticsPage() {
	return (
		<div>
			<AnalyticsTable />
		</div>
	);
}
