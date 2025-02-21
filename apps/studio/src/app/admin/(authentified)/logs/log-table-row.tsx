"use client";

import type { Log } from "@knowledgex/shared/log";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import type { Virtualizer } from "@tanstack/react-virtual";
import { memo } from "react";

interface LogTableRowProps {
	row: Row<Log>;
	rowRefsMap: React.MutableRefObject<Map<number, HTMLTableRowElement>>;
	rowVirtualizer: Virtualizer<HTMLDivElement, Element>;
	virtualRowIndex: number;
}

function LogTableRow({ row, rowRefsMap, rowVirtualizer, virtualRowIndex }: LogTableRowProps) {
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
			className="hover:bg-white transition-colors text-gray-700 border-b flex absolute min-w-full"
		>
			{row.getVisibleCells().map((cell) => (
				<td
					className="p-2 flex items-start"
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

	// Prevent rerenders only while scrolling
	return next.rowVirtualizer.isScrolling;
}) as typeof LogTableRow;
