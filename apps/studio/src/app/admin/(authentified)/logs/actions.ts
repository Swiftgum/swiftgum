"use server";

import { createClient } from "@/utils/supabase/server";
import type { Log } from "@knowledgex/shared/log";

const PAGE_SIZE = 50;

export const getLogs = async ({
	levels,
	resources,
	page = 0,
}: {
	levels?: string[];
	resources?: string[];
	page?: number;
} = {}) => {
	const supabase = await createClient();

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

	// Then get paginated data
	let query = supabase.from("logs").select("*");
	if (levels?.length) {
		query = query.in("level", levels);
	}
	if (resources?.length) {
		const resourceConditions = resources.map((resource) => `id.ilike.%${resource}%`);
		query = query.or(resourceConditions.join(","));
	}

	const { data, error } = await query
		.order("timestamp", { ascending: false })
		.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

	return {
		data,
		error,
		meta: {
			totalCount,
			pageSize: PAGE_SIZE,
		},
	} as {
		data: Log[];
		error: Error | null;
		meta: {
			totalCount: number;
			pageSize: number;
		};
	};
};

export const getLogMetrics = async () => {};
