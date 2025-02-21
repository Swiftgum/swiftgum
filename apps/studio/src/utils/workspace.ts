import { createClient } from "./supabase/server";

export async function getWorkspace() {
	const supabase = await createClient();

	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace")
		.select("workspace_id")
		.single();

	if (!workspace || workspaceError) {
		throw new Error("No workspace found");
	}

	return workspace;
}
