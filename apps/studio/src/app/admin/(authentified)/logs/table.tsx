"use client";

import { cn } from "@/lib/utils";
import type { Log } from "@knowledgex/shared/log";
import { useCallback, useEffect, useRef, useState } from "react";
import { LogDetailsSidebar } from "./log-details-sidebar";
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
	onRowClick,
	selectedLogId,
}: {
	table: ReturnType<typeof useLogsTable>["table"];
	rowVirtualizer: ReturnType<typeof useTableVirtualization<Log>>["rowVirtualizer"];
	rowRefsMap: ReturnType<typeof useTableVirtualization<Log>>["rowRefsMap"];
	isLoading: boolean;
	onRowClick: (log: Log) => void;
	selectedLogId: string | null;
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
						onClick={() => onRowClick(row.original)}
						isSelected={selectedLogId === row.original.log_id}
					/>
				);
			})}
		</tbody>
	);
}

export const AnalyticsTable = () => {
	const tableContainerRef = useRef<HTMLDivElement>(null);
	const resourceFilterRef = useRef<LogResourceFilterRef>(null);
	const [selectedLog, setSelectedLog] = useState<Log | null>(null);

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
		refetch,
	} = useLogsTable();

	const [selectedLevels, setSelectedLevels] = useState<Log["level"][]>(
		initialLevels.length > 0 ? initialLevels : ["info", "security", "warning", "error"],
	);
	const [selectedResources, setSelectedResources] = useState<string[]>(initialResources);

	const handleReset = useCallback(() => {
		setSelectedLevels(["info", "security", "warning", "error"]);
		setSelectedResources([]);
	}, []);

	const handleRefresh = useCallback(() => {
		refetch();
	}, [refetch]);

	const handleRowClick = useCallback((log: Log) => {
		setSelectedLog(log);
	}, []);

	const handleClose = useCallback(() => {
		setSelectedLog(null);
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
		<>
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
							onRefresh={handleRefresh}
							isRefreshing={isFetching}
						/>
						<TableBody
							table={table}
							rowVirtualizer={rowVirtualizer}
							rowRefsMap={rowRefsMap}
							isLoading={isLoading}
							onRowClick={handleRowClick}
							selectedLogId={selectedLog?.log_id ?? null}
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

			{/* Overlay when sidebar is open */}
			{selectedLog && false && (
				<div
					className="fixed inset-0 bg-black/20 transition-opacity animate-in fade-in duration-200"
					onClick={handleClose}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							handleClose();
						}
					}}
					role="button"
					tabIndex={0}
				/>
			)}

			{/* Sidebar positioned above the overlay */}
			<LogDetailsSidebar
				log={selectedLog}
				onClose={handleClose}
				className={cn(
					"z-50",
					selectedLog
						? "animate-in duration-300 ease-out slide-in-from-bottom md:slide-in-from-right md:slide-in-from-bottom-0"
						: "translate-x-full sm:translate-x-full translate-y-full md:translate-y-0",
				)}
			/>
		</>
	);
};
