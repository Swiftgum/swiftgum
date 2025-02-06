import { createClient } from "@/utils/supabase/server";
import GeneralPanel from "./generalpanel";
import { redirect } from "next/navigation";

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

	return (
		<div className="p-20">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Project Settings</h1>
			</div>

			{/* Pass workspace info to GeneralPanel */}
			<GeneralPanel workspaceId={workspace?.workspace_id ?? ""} label={workspace?.label ?? ""} />
		</div>
	);
}
