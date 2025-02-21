"use client";

import { Button } from "@/components/ui/button";
import type { Log } from "@knowledgex/shared/log";
import { X } from "lucide-react";

interface LogFiltersResetProps {
	selectedLevels: Log["level"][];
	selectedResources: string[];
	onReset: () => void;
}

export const LogFiltersReset = ({
	selectedLevels,
	selectedResources,
	onReset,
}: LogFiltersResetProps) => {
	const hasFilters = selectedLevels.length > 0 || selectedResources.length > 0;

	if (!hasFilters) {
		return null;
	}

	return (
		<Button variant="outline" size="sm" onClick={onReset}>
			<X className="h-3 w-3" />
		</Button>
	);
};
