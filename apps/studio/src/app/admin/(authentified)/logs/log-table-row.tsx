"use client";

import { cn } from "@/lib/utils";
import type { Log } from "@knowledgex/shared/log";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import { memo } from "react";

interface LogTableRowProps {
	row: Row<Log>;
	rowRefsMap: React.MutableRefObject<Map<number, HTMLTableRowElement>>;
	rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
	virtualRowIndex: number;
	onClick?: () => void;
	isSelected?: boolean;
}

function LogTableRow({
	row,
	rowRefsMap,
	rowVirtualizer,
	virtualRowIndex,
	onClick,
	isSelected,
}: LogTableRowProps) {
	return (
		<tr
			data-index={virtualRowIndex}
			ref={(node) => {
				if (node) {
					rowVirtualizer.measureElement(node);
					rowRefsMap.current.set(virtualRowIndex, node);
				}
			}}
			key={row.id}
			data-key={row.id}
			className={cn(
				"transition-colors text-gray-700 border-b flex absolute min-w-full cursor-pointer hover:bg-gray-100",
				isSelected && "bg-white hover:bg-white font-bold",
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
			tabIndex={0}
			// biome-ignore lint/a11y/useSemanticElements: this is a semantic table row
			role="button"
		>
			{row.getVisibleCells().map((cell) => (
				<td
					className={clsx(
						"px-2 flex items-center whitespace-nowrap h-8 overflow-hidden text-ellipsis border-r border-r-gray-100",
					)}
					key={cell.id}
					style={{
						width: `calc(var(--col-${cell.column.id}-size) * 1px)`,
					}}
				>
					{flexRender(cell.column.columnDef.cell, cell.getContext())}
				</td>
			))}
		</tr>
	);
}

// Only prevent rerenders while scrolling, but always rerender when data changes
export const MemoizedLogTableRow = memo(LogTableRow, (prev, next) => {
	// Always rerender if the row data changes
	if (prev.row.id !== next.row.id) return false;
	if (prev.virtualRowIndex !== next.virtualRowIndex) return false;
	if (prev.isSelected !== next.isSelected) return false;

	// Prevent rerenders only while scrolling
	return next.rowVirtualizer.isScrolling;
}) as typeof LogTableRow;
