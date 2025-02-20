import type { Log } from "@knowledgex/shared/log";

export const AnalyticsPanel = ({ log }: { log?: Log }) => {
	return (
		<div>
			<h2 className="text-lg font-medium">Log</h2>
			<pre>
				<code>{JSON.stringify(log, null, 2)}</code>
			</pre>
		</div>
	);
};
