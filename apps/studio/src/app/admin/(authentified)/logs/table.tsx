"use client";

import { type Log, splitResourceUris } from "@knowledgex/shared/log";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import clsx from "clsx";
import { Cpu, Info, Key, Lock, ToyBrick } from "lucide-react";
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

const ResourceBadge = ({
	resourceUri,
}: { resourceUri: ReturnType<typeof splitResourceUris>[number] }) => {
	return (
		<span
			className="inline-flex items-center gap-1.5 text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600"
			title={`${resourceUri.resource}:${resourceUri.id}`}
		>
			{(() => {
				switch (resourceUri.resource) {
					case "task":
						return <Cpu className="w-3 h-3" />;
					case "integration":
						return <ToyBrick className="w-3 h-3" />;
					case "token":
						return <Key className="w-3 h-3" />;
					default:
						return <span>{resourceUri.resource}</span>;
				}
			})()}
			<span>{resourceUri.id.split("-")[0]}</span>
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
				{
					header: "Resources",
					accessorKey: "id",
					cell: ({ cell }) => {
						const value = cell.getValue() as string;
						const resources = splitResourceUris(value);

						return (
							<div className="flex flex-wrap gap-1 items-center">
								{resources.map((resource) => (
									<ResourceBadge key={resource.id} resourceUri={resource} />
								))}
							</div>
						);
					},
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
		<table className="w-full font-mono text-sm max-h-screen overflow-y-auto">
			<thead className="sticky top-0 bg-white shadow-sm z-10">
				{table.getHeaderGroups().map((headerGroup) => (
					<tr key={headerGroup.id} className="border-b">
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
					<tr className="border-b" key={row.original.log_id}>
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
