import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import GeneralPanel from "./generalpanel";

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
		.select("workspace_id, label, app_name, app_icon")
		.eq("owner_user_id", user.id)
		.single();

	if (workspaceError || !workspace?.workspace_id || !workspace?.label) {
		console.error("Error fetching workspace:", workspaceError);
		redirect("/error");
	}

	return (
		<div className="p-20 flex flex-col gap-4">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Project Settings</h1>
			</div>
			<GeneralPanel
				label={workspace.label}
				workspaceId={workspace.workspace_id}
				appName={workspace.app_name || undefined}
				appIcon={workspace.app_icon || undefined}
			/>
		</div>
	);
}
