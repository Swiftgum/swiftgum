"use client";

import type { Log } from "@knowledgex/shared/log";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import clsx from "clsx";
import { Info, Lock } from "lucide-react";
import { useMemo } from "react";

const LevelBadge = ({ level }: { level: Log["level"] }) => {
	return (
		<span
			className={clsx(
				"inline-flex items-center gap-1",
				level === "verbose" && "",
				level === "info" && "text-blue-600",
				level === "security" && "text-amber-600",
			)}
		>
			{level === "info" && <Info className="w-3 h-3" />}
			{level === "security" && <Lock className="w-3 h-3" />}
			{level}
		</span>
	);
};

export const AnalyticsTable = ({
	logs,
}: {
	logs: Log[];
}) => {
	const columns = useMemo(
		() =>
			[
				{
					header: "Timestamp",
					accessorKey: "timestamp",
					cell: ({ cell }) => {
						const value = cell.getValue() as Log["timestamp"];

						return <span suppressHydrationWarning>{new Date(value).toLocaleString()}</span>;
					},
				},
				{
					header: "Level",
					accessorKey: "level",
					cell: ({ cell }) => {
						const value = cell.getValue() as Log["level"];

						return <LevelBadge level={value} />;
					},
				},
				{
					header: "Type",
					accessorKey: "type",
				},
				{
					header: "Name",
					accessorKey: "name",
				},
			] as ColumnDef<Log>[],
		[],
	);

	const table = useReactTable({
		data: logs,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<table className="w-full font-mono text-sm">
			<thead>
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<th className="text-left p-2" key={header.id}>
								{header.isPlaceholder
									? null
									: flexRender(header.column.columnDef.header, header.getContext())}
							</th>
						))}
					</tr>
				))}
			</thead>
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr className="border-t" key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td className="p-2" key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};
