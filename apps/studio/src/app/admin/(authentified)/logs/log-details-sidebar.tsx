"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Log } from "@knowledgex/shared/log";
import { splitResourceUris } from "@knowledgex/shared/log";
import { X } from "lucide-react";
import { LogLevelBadge } from "./log-level-badge";
import { ResourceBadge } from "./log-resource-badge";

type LogDetailsSidebarProps = {
	log: Log | null;
	onClose: () => void;
	className?: string;
};

export function LogDetailsSidebar({ log, onClose, className }: LogDetailsSidebarProps) {
	if (!log) return null;

	const resources = log.id ? splitResourceUris(log.id) : [];

	return (
		<div
			className={cn(
				"fixed top-0 inset-x-0 md:inset-x-auto inset-y-0 md:right-0 max-w-screen-sm",
				// Mobile positioning
				"bg-white shadow-lg border-t sm:border-l sm:border-t-0",
				className,
			)}
		>
			<div className="flex h-full flex-col">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<h2 className="text-lg font-semibold">Log Details</h2>
					<Button variant="ghost" size="icon" onClick={onClose}>
						<X className="h-4 w-4" />
					</Button>
				</div>

				<ScrollArea className="flex-1 p-4">
					<div className="space-y-6">
						{/* Basic Info */}
						<div>
							<h3 className="font-medium text-gray-500">Basic Information</h3>
							<dl className="mt-2 space-y-1">
								<div className="flex justify-between">
									<dt className="text-gray-500">ID</dt>
									<dd className="font-mono">{log.log_id}</dd>
								</div>
								<div className="flex justify-between">
									<dt className="text-gray-500">Timestamp</dt>
									<dd>{new Date(log.timestamp).toLocaleString()}</dd>
								</div>
								<div className="flex justify-between">
									<dt className="text-gray-500">Level</dt>
									<dd>
										<LogLevelBadge level={log.level} />
									</dd>
								</div>
								<div className="flex justify-between">
									<dt className="text-gray-500">Type</dt>
									<dd>{log.type}</dd>
								</div>
								<div className="flex justify-between">
									<dt className="text-gray-500">Name</dt>
									<dd>{log.name}</dd>
								</div>
							</dl>
						</div>

						{/* Resources Section */}
						{resources.length > 0 && (
							<div>
								<h3 className="font-medium text-gray-500">Resources</h3>
								<div className="mt-2 flex flex-wrap gap-1">
									{resources.map((resource) => (
										<ResourceBadge
											key={`${resource.resource}:${resource.id}`}
											resourceUri={resource}
											onResourceClick={(resource) => {
												window.dispatchEvent(
													new CustomEvent("addLogResource", { detail: resource }),
												);
											}}
											shorten={false}
										/>
									))}
								</div>
							</div>
						)}

						{/* IDs Section */}
						{(log.workspace_id || log.user_id || log.end_user_id) && (
							<div>
								<h3 className="font-medium text-gray-500">Related IDs</h3>
								<dl className="mt-2 space-y-1">
									{log.workspace_id && (
										<div className="flex justify-between">
											<dt className="text-gray-500">Workspace ID</dt>
											<dd className="font-mono">{log.workspace_id}</dd>
										</div>
									)}
									{log.user_id && (
										<div className="flex justify-between">
											<dt className="text-gray-500">User ID</dt>
											<dd className="font-mono">{log.user_id}</dd>
										</div>
									)}
									{log.end_user_id && (
										<div className="flex justify-between">
											<dt className="text-gray-500">End User ID</dt>
											<dd className="font-mono">{log.end_user_id}</dd>
										</div>
									)}
								</dl>
							</div>
						)}

						{/* Metadata Section */}
						{log.metadata && (
							<div>
								<h3 className="font-medium text-gray-500">Metadata</h3>
								<pre className="mt-2 whitespace-pre-wrap rounded bg-gray-50 p-2 text-xs">
									{JSON.stringify(log.metadata, null, 2)}
								</pre>
							</div>
						)}
					</div>
				</ScrollArea>
			</div>
		</div>
	);
}
