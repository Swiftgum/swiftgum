"use server";

import { createClient } from "@/utils/supabase/server";
import type { Log } from "@knowledgex/shared/log";

export const getLogs = async ({
	levels,
	resources,
	cursor,
}: {
	levels?: string[];
	resources?: string[];
	cursor?: { timestamp: string; log_id: string };
} = {}) => {
	const supabase = await createClient();
	const PAGE_SIZE = 50;

	// First get total count
	let countQuery = supabase.from("logs").select("*", { count: "exact", head: true });
	if (levels?.length) {
		countQuery = countQuery.in("level", levels);
	}
	if (resources?.length) {
		const resourceConditions = resources.map((resource) => `id.ilike.%${resource}%`);
		countQuery = countQuery.or(resourceConditions.join(","));
	}
	const { count: totalCount } = await countQuery;

	// Build the main query
	let query = supabase.from("logs").select("*");

	// Apply filters
	if (levels?.length) {
		query = query.in("level", levels);
	}
	if (resources?.length) {
		const resourceConditions = resources.map((resource) => `id.ilike.%${resource}%`);
		query = query.or(resourceConditions.join(","));
	}

	// Apply cursor conditions if we have a cursor
	if (cursor) {
		query = query.or(
			`and(timestamp.lt.${cursor.timestamp},log_id.gt.${cursor.log_id}),timestamp.lt.${cursor.timestamp}`,
		);
	}

	const { data, error } = await query
		.order("timestamp", { ascending: false })
		.order("log_id", { ascending: true })
		.limit(PAGE_SIZE);

	return {
		data,
		error,
		meta: {
			totalCount,
			pageSize: PAGE_SIZE,
			nextCursor:
				data?.length === PAGE_SIZE
					? {
							timestamp: data[data.length - 1].timestamp,
							log_id: data[data.length - 1].log_id,
						}
					: null,
		},
	} as {
		data: Log[];
		error: Error | null;
		meta: {
			totalCount: number;
			pageSize: number;
			nextCursor: { timestamp: string; log_id: string } | null;
		};
	};
};

export const getLogMetrics = async () => {};
