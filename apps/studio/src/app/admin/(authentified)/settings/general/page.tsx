import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, createServerOnlyClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GeneralPanel from "./generalpanel";

async function getWorkspaceToken() {
	const client = await createClient();
	const { data: workspace, error: workspaceError } = await client
		.from("workspace")
		.select("workspace_id")
		.single();

	if (workspaceError) {
		throw new Error("Error fetching workspace:", workspaceError);
	}

	const serverClient = await createServerOnlyClient();

	const { data: token, error: tokenError } = await serverClient
		.schema("private")
		.from("workspace_with_decrypted_api_key")
		.select("decrypted_api_key")
		.eq("workspace_id", workspace.workspace_id)
		.single();

	if (tokenError) {
		throw new Error("Error fetching workspace token:", tokenError);
	}

	return token.decrypted_api_key ?? "";
}

export default async function Providers() {
	const supabase = await createClient();

	// Get authenticated user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		if (!user) redirect("/");
	}

	// Fetch workspace info
	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace")
		.select("workspace_id, label")
		.eq("owner_user_id", user.id)
		.single();

	if (workspaceError) {
		console.error("Error fetching workspace:", workspaceError);
	}

	const key = await getWorkspaceToken();

	return (
		<div className="p-20 flex flex-col gap-4">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Project Settings</h1>
			</div>
			{/* Pass workspace info to GeneralPanel */}
			<GeneralPanel workspaceId={workspace?.workspace_id ?? ""} label={workspace?.label ?? ""} />
			<Card>
				<CardContent className="space-y-6 p-5">
					<h2 className="text-xl font-bold text-zinc-700">API Key</h2>
					<Input type="text" value={key} className="w-full" />
				</CardContent>
			</Card>
		</div>
	);
}
