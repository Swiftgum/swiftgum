import { getLogs } from "./actions";
import { AnalyticsGraph } from "./graph";
import { AnalyticsTable } from "./table";

export default async function AnalyticsPage() {
	const logs = await getLogs();

	return (
		<div>
			<AnalyticsGraph />
			<AnalyticsTable logs={logs.data} />
		</div>
	);
}
