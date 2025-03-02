"use server";

import { log } from "@/utils/log";
import { createServerOnlyClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/utils/workspace";

export async function getApiKey() {
	// First get the workspace through RLS to ensure user has access
	const workspace = await getWorkspace();

	// Then use server-only client to access private schema
	const supabase = await createServerOnlyClient();
	const { data: token, error: tokenError } = await supabase
		.schema("private")
		.from("workspace_with_decrypted_api_key")
		.select("decrypted_api_key")
		.eq("workspace_id", workspace.workspace_id)
		.single();

	if (tokenError) {
		throw new Error("Error fetching API key");
	}

	void log({
		level: "security",
		type: "api-key",
		name: "read",
		workspace_id: workspace.workspace_id,
		metadata: {},
		private: false,
	});

	return token.decrypted_api_key ?? "";
}

export async function rotateApiKey(formData: FormData) {
	// First get the workspace through RLS to ensure user has access
	const workspace = await getWorkspace();

	// Then use server-only client to access private schema
	const supabase = await createServerOnlyClient();
	const { data, error } = await supabase.schema("private").rpc("rotate_api_key", {
		p_workspace_id: workspace.workspace_id,
	});

	if (error) {
		throw new Error("Error rotating API key");
	}

	void log({
		level: "security",
		type: "api-key",
		name: "rotated",
		workspace_id: workspace.workspace_id,
		metadata: {},
		private: false,
	});

	// Return the new key
	return data;
}
