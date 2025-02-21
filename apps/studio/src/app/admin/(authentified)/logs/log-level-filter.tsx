"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Log } from "@knowledgex/shared/log";
import { Filter } from "lucide-react";
import { LogLevelBadge } from "./log-level-badge";

const LOG_LEVELS: Log["level"][] = ["verbose", "debug", "info", "security", "warning", "error"];

export const LogLevelFilter = ({
	onLevelsChange,
	selectedLevels,
}: {
	onLevelsChange: (levels: Log["level"][]) => void;
	selectedLevels: Log["level"][];
}) => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm">
					<Filter className="h-3 w-3" />
					{selectedLevels.length === 0 ? (
						"All levels"
					) : selectedLevels.length === 1 ? (
						<LogLevelBadge level={selectedLevels[0]} />
					) : (
						`${selectedLevels.length} levels`
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-48">
				<div className="p-2 flex flex-col gap-2">
					{LOG_LEVELS.map((level) => (
						<div key={level} className="flex items-center space-x-2">
							<Checkbox
								id={`level-${level}`}
								checked={selectedLevels.includes(level)}
								onCheckedChange={(checked) => {
									onLevelsChange(
										checked
											? [...selectedLevels, level]
											: selectedLevels.filter((l) => l !== level),
									);
								}}
							/>
							<label
								htmlFor={`level-${level}`}
								className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center"
							>
								<LogLevelBadge level={level} />
							</label>
						</div>
					))}
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
