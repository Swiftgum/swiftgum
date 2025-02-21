"use client";

import type { Log } from "@knowledgex/shared/log";
import { useInfiniteQuery } from "@tanstack/react-query";
import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useCallback, useMemo } from "react";
import { getLogs } from "./actions";
import { useColumns } from "./use-columns";
import { useFilterParams } from "./use-filter-params";

type Cursor = { timestamp: string; log_id: string } | undefined;

export function useLogsTable() {
	const { getFilters, setFilters } = useFilterParams();
	const { levels: initialLevels, resources: initialResources } = getFilters();

	const columns = useColumns();

	const { data, fetchNextPage, isFetching, isLoading, hasNextPage, refetch } = useInfiniteQuery({
		queryKey: ["logs", initialLevels, initialResources],
		queryFn: async ({ pageParam }) => {
			const result = await getLogs({
				levels: initialLevels,
				resources: initialResources,
				cursor: pageParam as Cursor,
			});
			return result;
		},
		initialPageParam: undefined as Cursor,
		getNextPageParam: (lastPage) => lastPage.meta.nextCursor || undefined,
		refetchOnWindowFocus: false,
	});

	const flatData = useMemo(() => data?.pages?.flatMap((page) => page.data) ?? [], [data]);
	const totalDBRowCount = data?.pages?.[0]?.meta?.totalCount ?? 0;

	const fetchMoreOnBottomReached = useCallback(
		(containerRefElement?: HTMLDivElement | null) => {
			if (containerRefElement) {
				const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
				if (scrollHeight - scrollTop - clientHeight < 500 && !isFetching && hasNextPage) {
					fetchNextPage();
				}
			}
		},
		[fetchNextPage, isFetching, hasNextPage],
	);

	const table = useReactTable({
		data: flatData,
		getRowId: (row) => row.log_id,
		columns,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: "onChange",
		enableColumnResizing: true,
	});

	return {
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
	};
}
