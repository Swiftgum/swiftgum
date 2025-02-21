"use client";

import type { Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export function useTableVirtualization<T>({
	table,
	containerRef,
}: {
	table: Table<T>;
	containerRef: React.RefObject<HTMLDivElement | null>;
}) {
	const rowRefsMap = useRef<Map<number, HTMLTableRowElement>>(new Map());

	const updateRowPosition = useCallback((index: number, start: number) => {
		const rowRef = rowRefsMap.current.get(index);
		if (rowRef) {
			rowRef.style.transform = `translateY(${start}px)`;
		}
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		estimateSize: () => 33,
		getScrollElement: () => containerRef.current,
		measureElement:
			typeof window !== "undefined" && navigator.userAgent.indexOf("Firefox") === -1
				? (element) => {
						const height = element?.getBoundingClientRect().height;
						// Get the index from the data-index attribute
						const index = Number(element?.getAttribute("data-index"));
						if (!Number.isNaN(index)) {
							// Update position immediately after measurement
							const virtualRow = rowVirtualizer.getVirtualItems().find((v) => v.index === index);
							if (virtualRow) {
								updateRowPosition(index, virtualRow.start);
							}
						}
						return height;
					}
				: undefined,
		overscan: 5,
		onChange: (instance) => {
			for (const virtualRow of instance.getVirtualItems()) {
				updateRowPosition(virtualRow.index, virtualRow.start);
			}
		},
	});

	// Remeasure virtualizer when data changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		// Clear the row refs map when data changes
		rowRefsMap.current.clear();
		// Force a remeasure after a short delay to ensure DOM is updated
		const timer = setTimeout(() => {
			rowVirtualizer.measure();
		}, 0);
		return () => clearTimeout(timer);
	}, [rowVirtualizer, table.getRowModel().rows]);

	// Initial measurement
	useLayoutEffect(() => {
		rowVirtualizer.measure();
	}, [rowVirtualizer]);

	return {
		rowVirtualizer,
		rowRefsMap,
	};
}
