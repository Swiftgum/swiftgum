import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./types";

export function createClient() {
	if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error("Missing Supabase environment variables");
	}

	// Create a supabase client on the browser with project's credentials
	return createBrowserClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	);
}
