import { getLogs } from "./actions";
import { AnalyticsTable } from "./table";

export default async function AnalyticsPage() {
	const logs = await getLogs();

	return (
		<div>
			<AnalyticsTable logs={logs.data} />
		</div>
	);
}
