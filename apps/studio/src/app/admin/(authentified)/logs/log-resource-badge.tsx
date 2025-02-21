"use client";

import type { splitResourceUris } from "@knowledgex/shared/log";
import { CloudUpload, Cpu, Key, Monitor, Puzzle, ToyBrick, User } from "lucide-react";

type ResourceBadgeProps = {
	resourceUri: ReturnType<typeof splitResourceUris>[number];
	onResourceClick?: (resource: ReturnType<typeof splitResourceUris>[number]) => void;
	shorten?: boolean;
};

export function ResourceBadge({
	resourceUri,
	onResourceClick,
	shorten = true,
}: ResourceBadgeProps) {
	return (
		<button
			type="button"
			className="inline-flex items-center gap-1.5 text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 transition-colors font-mono"
			title={`${resourceUri.resource}:${resourceUri.id}`}
			onClick={(e) => {
				e.stopPropagation();
				onResourceClick?.(resourceUri);
			}}
		>
			{(() => {
				switch (resourceUri.resource) {
					case "task":
						return <Cpu className="w-3 h-3" />;
					case "integration":
						return <ToyBrick className="w-3 h-3" />;
					case "token":
						return <Key className="w-3 h-3" />;
					case "portal_session":
						return <Monitor className="w-3 h-3" />;
					case "end_user":
						return <User className="w-3 h-3" />;
					case "provider":
						return <Puzzle className="w-3 h-3" />;
					case "destination":
						return <CloudUpload className="w-3 h-3" />;
					default:
						return <span>{resourceUri.resource}</span>;
				}
			})()}
			<span>{shorten ? resourceUri.id.split("-")[0] : resourceUri.id}</span>
		</button>
	);
}
