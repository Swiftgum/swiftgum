"use server";

import { createClient } from "@/utils/supabase/server";
import type { Log } from "@knowledgex/shared/log";

export const getLogs = async () => {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from("logs")
		.select("*")
		// .neq("level", "verbose")
		.order("timestamp", { ascending: false });

	return { data, error } as {
		data: Log[];
		error: Error | null;
	};
};

export const getLogMetrics = async () => {};
