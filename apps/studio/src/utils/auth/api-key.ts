import { createServerOnlyClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";

export const authenticateApiKey = async (req: NextRequest) => {
	const apiKey = req.headers.get("X-API-Key");

	if (!apiKey) {
		throw new Error("API key is required");
	}

	const supabase = await createServerOnlyClient();

	// Get the workspace associated with the API key
	const { data: workspace, error } = await supabase
		.schema("private")
		.rpc("get_workspace_by_api_key", {
			p_api_key: apiKey,
		});

	if (error || !workspace || !workspace.workspace_id) {
		console.error(error);
		throw new Error("Invalid API key");
	}

	return workspace;
};
