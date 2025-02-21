"use client";

import type { Log } from "@knowledgex/shared/log";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { LogFiltersReset } from "./log-filters-reset";
import { LogLevelFilter } from "./log-level-filter";
import { LogResourceFilter, type LogResourceFilterRef } from "./log-resource-filter";

interface TableHeaderProps {
	table: Table<Log>;
	selectedLevels: Log["level"][];
	selectedResources: string[];
	onLevelsChange: (levels: Log["level"][]) => void;
	onResourcesChange: (resources: string[]) => void;
	onReset: () => void;
	resourceFilterRef: React.RefObject<LogResourceFilterRef | null>;
}

export function TableHeader({
	table,
	selectedLevels,
	selectedResources,
	onLevelsChange,
	onResourcesChange,
	onReset,
	resourceFilterRef,
}: TableHeaderProps) {
	return (
		<thead className="shadow-sm bg-white w-full z-10 sticky top-0">
			<tr style={{ display: "flex", width: "100%" }}>
				<th colSpan={table.getAllColumns().length} className="p-2 w-full">
					<div className="flex items-center gap-2">
						<LogLevelFilter onLevelsChange={onLevelsChange} selectedLevels={selectedLevels} />
						<LogResourceFilter
							ref={resourceFilterRef}
							onResourcesChange={onResourcesChange}
							selectedResources={selectedResources}
						/>
						<LogFiltersReset
							selectedLevels={selectedLevels}
							selectedResources={selectedResources}
							onReset={onReset}
						/>
					</div>
				</th>
			</tr>
			{table.getHeaderGroups().map((headerGroup) => (
				<tr
					key={headerGroup.id}
					className="border-y min-w-full"
					style={{ display: "flex", width: "100%" }}
				>
					{headerGroup.headers.map((header) => (
						<th
							className="text-left p-2 group relative border-r box-border"
							key={header.id}
							style={{
								display: "flex",
								width: `calc(var(--header-${header.id}-size) * 1px)`,
							}}
						>
							{header.isPlaceholder
								? null
								: flexRender(header.column.columnDef.header, header.getContext())}
							{header.column.getCanResize() && (
								<div
									onMouseDown={header.getResizeHandler()}
									onTouchStart={header.getResizeHandler()}
									onDoubleClick={() => header.column.resetSize()}
									className={`absolute right-0 top-0 h-full w-3 cursor-col-resize select-none touch-none flex items-center justify-center group-hover:bg-gray-100 ${
										header.column.getIsResizing()
											? "bg-gray-100 opacity-100"
											: "opacity-0 group-hover:opacity-100"
									}`}
								>
									<GripVertical className="h-4 w-4 text-gray-500" />
								</div>
							)}
						</th>
					))}
				</tr>
			))}
		</thead>
	);
}
