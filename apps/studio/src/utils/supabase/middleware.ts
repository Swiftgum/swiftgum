import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import type { Database } from "@knowledgex/shared/types/database";

export async function updateSession(request: NextRequest) {
	if (
		(!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) ||
		!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	) {
		throw new Error("Missing Supabase environment variables");
	}

	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient<Database>(
		(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) as string,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					supabaseResponse = NextResponse.next({
						request,
					});
					for (const { name, value, options } of cookiesToSet) {
						supabaseResponse.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	// refreshing the auth token
	await supabase.auth.getUser();

	return supabaseResponse;
}
