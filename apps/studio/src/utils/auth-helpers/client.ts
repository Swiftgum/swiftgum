"use client";

import { getURL } from "@/utils/helpers";
import { createClient } from "@/utils/supabase/client";
import type { Provider } from "@supabase/supabase-js";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { redirectToPath } from "./server";

export async function handleRequest(
	e: React.FormEvent<HTMLFormElement>,
	requestFunc: (formData: FormData) => Promise<string>,
	router: AppRouterInstance | null = null,
): Promise<boolean | undefined> {
	// Prevent default form submission refresh
	e.preventDefault();

	const formData = new FormData(e.currentTarget);
	const redirectUrl: string = await requestFunc(formData);

	if (router) {
		// If client-side router is provided, use it to redirect
		router.push(redirectUrl);
		return true;
	}
	// Otherwise, redirect server-side
	return await redirectToPath(redirectUrl);
}

export async function signInWithOAuth(e: React.FormEvent<HTMLFormElement>) {
	// Prevent default form submission refresh
	e.preventDefault();
	const formData = new FormData(e.currentTarget);
	const provider = String(formData.get("provider")).trim() as Provider;

	// Create client-side supabase client and call signInWithOAuth
	const supabase = createClient();
	const redirectURL = getURL("/auth/callback?redirect_to=/admin");
	console.log("redirectURL: ", redirectURL);
	await supabase.auth.signInWithOAuth({
		provider: provider,
		options: {
			redirectTo: redirectURL,
		},
	});
}
