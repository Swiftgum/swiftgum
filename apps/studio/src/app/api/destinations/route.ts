import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
	const supabase = await createClient();
	const { destinationId, workspaceId, dataToEncrypt } = await req.json();

	// Validate inputs
	if (!workspaceId) {
		return NextResponse.json(
			{
				error: "Workspace ID is required.",
			},
			{ status: 400 },
		);
	}

	// Authenticate user
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	console.log(dataToEncrypt);
	const { data: encryptedCredentials, error: encryptionError } = await supabase.rpc(
		"encrypt_destination_params",
		{
			p_workspace_id: workspaceId,
			p_params: dataToEncrypt,
		},
	);

	if (encryptionError)
		return NextResponse.json({ error: "Failed to encrypt credentials" }, { status: 500 });

	if (destinationId) {
		// Update existing integration
		const { error } = await supabase
			.from("destinations")
			.update({
				encrypted_destination_params: encryptedCredentials,
				updated_at: new Date().toISOString(),
			})
			.eq("destination_id", destinationId);
		if (error) {
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}
	} else {
		// Insert new integration
		const { error } = await supabase.from("destinations").insert({
			workspace_id: workspaceId,
			encrypted_destination_params: encryptedCredentials,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		});
		if (error) {
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true });
}
