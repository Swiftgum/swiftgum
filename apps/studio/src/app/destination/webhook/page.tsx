import { createClient, createServerOnlyClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DestionationPanel from "./destinationpanel";

type Destination = {
	created_at: string | null;
	decrypted_destination_params: {
		type: (string | null) & (JSON | null);
	} | null;
	destination_id: string | null;
	encrypted_destination_params: string | null;
	updated_at: string | null;
	workspace_id: string | null;
};

export default async function Providers() {
	const supabase = await createClient();
	const supabaseServer = await createServerOnlyClient();

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

	if (!workspace) return <p>Workspace not found</p>;

	// Fetch workspace info
	const { data: destinations_with_decrypted_params, error: destinationsWithDecryptedParamsError } =
		await supabaseServer
			.schema("private")
			.from("destinations_with_decrypted_params")
			.select("*")
			.eq("workspace_id", workspace.workspace_id);

	return (
		<div className="p-20">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Webhook Destination</h1>
				<p className="text-gray-600">
					Configure and manage webhook endpoints for seamless data delivery
				</p>
			</div>

			{/* Pass workspace info to GeneralPanel */}
			<DestionationPanel
				workspaceId={workspace?.workspace_id ?? ""}
				destinations={(destinations_with_decrypted_params as Destination[]) ?? []}
			/>
		</div>
	);
}
