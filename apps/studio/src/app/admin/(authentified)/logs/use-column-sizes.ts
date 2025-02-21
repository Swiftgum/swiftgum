"use client";

import type { Table } from "@tanstack/react-table";
import { useMemo } from "react";

export function useColumnSizes<T>(table: Table<T>) {
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	return useMemo(() => {
		const headers = table.getFlatHeaders();
		const colSizes: { [key: string]: number } = {};
		for (let i = 0; i < headers.length; i++) {
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			const header = headers[i]!;
			colSizes[`--header-${header.id}-size`] = header.getSize();
			colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
		}
		return colSizes;
	}, [table.getState().columnSizingInfo, table.getState().columnSizing]);
}
