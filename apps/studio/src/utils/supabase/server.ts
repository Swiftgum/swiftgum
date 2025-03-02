"use server";
/**
 * EXTREMELY IMPORTANT, do not remove the "use server" directive.
 * This file contains privileged server-only code.
 *
 * Removing this directive may leak sensitive information to the client.
 */

import type { Database } from "@knowledgex/shared/types/database";
import type { Database as ServerDatabase } from "@knowledgex/shared/types/database-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerOnlyClient() {
	if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
		throw new Error("Missing Supabase service role key");
	}

	return createServerClient<ServerDatabase>(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.SUPABASE_SERVICE_ROLE_KEY,
		{
			cookies: {
				getAll() {
					return null;
				},
			},
		},
	);
}

export async function createClient() {
	const cookieStore = await cookies();

	if (
		(!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) ||
		!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	) {
		throw new Error("Missing Supabase environment variables");
	}

	// Create a server's supabase client with newly configured cookie,
	// which could be used to maintain user's session
	return createServerClient<Database>(
		(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					try {
						for (const { name, value, options } of cookiesToSet) {
							cookieStore.set(name, value, options);
						}
					} catch {
						// The `setAll` method was called from a Server Component.
						// This can be ignored if you have middleware refreshing
						// user sessions.
					}
				},
			},
		},
	);
}
