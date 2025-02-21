"use client";

import { Input } from "@/components/ui/input";
import type { splitResourceUris } from "@knowledgex/shared/log";
import { forwardRef, useImperativeHandle } from "react";

export type LogResourceFilterRef = {
	addResource: (resource: ReturnType<typeof splitResourceUris>[number]) => void;
};

export const LogResourceFilter = forwardRef<
	LogResourceFilterRef,
	{
		onResourcesChange: (resources: string[]) => void;
		selectedResources: string[];
	}
>(({ onResourcesChange, selectedResources }, ref) => {
	const addResource = (resourceUri: ReturnType<typeof splitResourceUris>[number]) => {
		const resourceString = `${resourceUri.resource}:${resourceUri.id}`;
		if (!selectedResources.includes(resourceString)) {
			onResourcesChange([...selectedResources, resourceString]);
		}
	};

	useImperativeHandle(ref, () => ({
		addResource,
	}));

	return (
		<div className="flex items-center gap-2">
			<Input
				value={selectedResources.join(", ")}
				onChange={(e) => {
					const resources = e.target.value
						.split(",")
						.map((r) => r.trim())
						.filter(Boolean);
					onResourcesChange(resources);
				}}
				placeholder="Filter by resources (e.g. task:123, integration:456)"
				className="w-96 font-normal"
				size="sm"
			/>
		</div>
	);
});

// Export both the component and the addResource function
export const useResourceFilter = (
	onResourceClick: (resource: ReturnType<typeof splitResourceUris>[number]) => void,
) => {
	return {
		handleResourceClick: onResourceClick,
	};
};
