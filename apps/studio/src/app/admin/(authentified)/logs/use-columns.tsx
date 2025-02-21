"use client";

import type { Log } from "@knowledgex/shared/log";
import { splitResourceUris } from "@knowledgex/shared/log";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { LogLevelBadge } from "./log-level-badge";
import { ResourceBadge } from "./log-resource-badge";

export function useColumns() {
	return useMemo(
		() =>
			[
				{
					header: "Timestamp",
					accessorKey: "timestamp",
					cell: ({ cell }) => {
						const value = cell.getValue() as Log["timestamp"];
						const date = new Date(value);

						return (
							<span suppressHydrationWarning>
								{date.toLocaleDateString(undefined, {
									day: "2-digit",
									month: "short",
								})}{" "}
								{date.toLocaleTimeString(undefined, {
									hour: "2-digit",
									minute: "2-digit",
									second: "2-digit",
									hour12: false,
								})}
							</span>
						);
					},
					size: 150,
					minSize: 120,
				},
				{
					header: "Level",
					accessorKey: "level",
					cell: ({ cell }) => {
						const value = cell.getValue() as Log["level"];
						return <LogLevelBadge level={value} />;
					},
					size: 100,
					minSize: 80,
				},
				{
					header: "Type",
					accessorKey: "type",
					size: 150,
					minSize: 100,
				},
				{
					header: "Name",
					accessorKey: "name",
					size: 150,
					minSize: 100,
				},
				{
					header: "Resources",
					accessorKey: "id",
					cell: ({ cell }) => {
						const value = cell.getValue() as string;
						const resources = splitResourceUris(value || "");

						return (
							<div className="flex flex-nowrap gap-1 items-center">
								{resources.map((resource) => (
									<ResourceBadge
										key={`${resource.resource}:${resource.id}`}
										resourceUri={resource}
										onResourceClick={(resource) => {
											// We'll handle this through context
											window.dispatchEvent(new CustomEvent("addLogResource", { detail: resource }));
										}}
									/>
								))}
							</div>
						);
					},
					size: 300,
					minSize: 200,
				},
			] as ColumnDef<Log>[],
		[],
	);
}
