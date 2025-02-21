"use client";

import type { Log } from "@knowledgex/shared/log";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LogResourceFilterRef } from "./log-resource-filter";
import { MemoizedLogTableRow } from "./log-table-row";
import { TableHeader } from "./table-header";
import { useColumnSizes } from "./use-column-sizes";
import { useLogsTable } from "./use-logs-table";
import { useTableVirtualization } from "./use-table-virtualization";

function TableBody({
	rowVirtualizer,
	table,
	rowRefsMap,
	isLoading,
}: {
	table: ReturnType<typeof useLogsTable>["table"];
	rowVirtualizer: ReturnType<typeof useTableVirtualization<Log>>["rowVirtualizer"];
	rowRefsMap: ReturnType<typeof useTableVirtualization<Log>>["rowRefsMap"];
	isLoading: boolean;
}) {
	const { rows } = table.getRowModel();
	const virtualRowIndexes = rowVirtualizer.getVirtualItems().map((item) => item.index);

	if (isLoading) {
		return (
			<tbody
				style={{
					display: "grid",
					height: "100px",
					position: "relative",
					width: "100%",
				}}
			>
				<tr className="absolute inset-0 flex items-center justify-center">
					<td>Loading...</td>
				</tr>
			</tbody>
		);
	}

	return (
		<tbody
			style={{
				display: "grid",
				height: `${rowVirtualizer.getTotalSize()}px`,
				position: "relative",
				width: "100%",
			}}
		>
			{virtualRowIndexes.map((virtualRowIndex) => {
				const row = rows[virtualRowIndex];
				return (
					<MemoizedLogTableRow
						key={row.id}
						row={row}
						rowRefsMap={rowRefsMap}
						rowVirtualizer={rowVirtualizer}
						virtualRowIndex={virtualRowIndex}
					/>
				);
			})}
		</tbody>
	);
}

export const AnalyticsTable = () => {
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const resourceFilterRef = useRef<LogResourceFilterRef>(null);

	const {
		table,
		isFetching,
		isLoading,
		flatData,
		totalDBRowCount,
		fetchMoreOnBottomReached,
		initialLevels,
		initialResources,
		setFilters,
	} = useLogsTable();

	const [selectedLevels, setSelectedLevels] = useState<Log["level"][]>(
		initialLevels.length > 0 ? initialLevels : ["info", "security", "warning", "error"],
	);
	const [selectedResources, setSelectedResources] = useState<string[]>(initialResources);

	const handleReset = useCallback(() => {
		setSelectedLevels(["info", "security", "warning", "error"]);
		setSelectedResources([]);
	}, []);

	// Update URL when filters change
	useEffect(() => {
		setFilters(selectedLevels, selectedResources);
		// Scroll to top when filters change
		tableContainerRef.current?.scrollTo(0, 0);
	}, [selectedLevels, selectedResources, setFilters]);

	// Listen for resource add events
	useEffect(() => {
		const handleAddResource = (e: Event) => {
			const resource = (e as CustomEvent).detail;
			resourceFilterRef.current?.addResource(resource);
		};
		window.addEventListener("addLogResource", handleAddResource);
		return () => window.removeEventListener("addLogResource", handleAddResource);
	}, []);

	const { rowVirtualizer, rowRefsMap } = useTableVirtualization({
		table,
		containerRef: tableContainerRef,
	});

	const columnSizeVars = useColumnSizes(table);

	return (
		<div className="h-screen flex flex-col">
			<div
				ref={tableContainerRef}
				className="w-full font-mono text-xs overflow-auto relative basis-0 flex-grow bg-gray-50"
				onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
			>
				<table className="grid w-full min-w-[fit-content]" style={{ ...columnSizeVars }}>
					<TableHeader
						table={table}
						selectedLevels={selectedLevels}
						selectedResources={selectedResources}
						onLevelsChange={setSelectedLevels}
						onResourcesChange={setSelectedResources}
						onReset={handleReset}
						resourceFilterRef={resourceFilterRef}
					/>
					<TableBody
						table={table}
						rowVirtualizer={rowVirtualizer}
						rowRefsMap={rowRefsMap}
						isLoading={isLoading}
					/>
				</table>
				{isFetching && !isLoading && (
					<div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-white border-t">
						Loading more...
					</div>
				)}
			</div>
			<div className="text-xs text-gray-500 border-t px-2 py-1">
				Showing {flatData.length} of {totalDBRowCount} logs
			</div>
		</div>
	);
};
