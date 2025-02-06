import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
	const supabase = await createClient();
	const { destinationId, workspaceId, dataToEncrypt } = await req.json();

	// Validate inputs
	if (!workspaceId) {
		return NextResponse.json({ error: "Workspace ID is required." }, { status: 400 });
	}

	// Authenticate user
	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();

	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	console.log("🔒 Encrypting credentials:", dataToEncrypt);

	// Encrypt data using Supabase RPC function
	const { data: encryptedCredentials, error: encryptionError } = await supabase.rpc(
		"encrypt_destination_params",
		{
			p_workspace_id: workspaceId,
			p_params: dataToEncrypt,
		}
	);

	if (encryptionError) {
		console.error("❌ Encryption failed:", encryptionError);
		return NextResponse.json({ error: "Failed to encrypt credentials" }, { status: 500 });
	}

	if (destinationId) {
		// Update existing integration
		const { data, error } = await supabase
			.from("destinations")
			.update({
				encrypted_destination_params: encryptedCredentials,
				updated_at: new Date().toISOString(),
			})
			.eq("destination_id", destinationId)
			.select();

		console.log("📝 Update Response:", data, error);

		if (error) {
			console.error("❌ Update error:", error);
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}

		// ✅ Catch RLS failure (if no rows were updated)
		if (!data || data.length === 0) {
			console.warn("🚨 RLS blocked update (no matching row or insufficient permissions)");
			return NextResponse.json({ error: "Forbidden: You do not have permission to update this destination." }, { status: 403 });
		}

		NextResponse.json({ success: true, updated: data });
	} else {
		// Insert new integration
		const { data, error } = await supabase
			.from("destinations")
			.insert({
				workspace_id: workspaceId,
				encrypted_destination_params: encryptedCredentials,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			})
			.select();

		console.log("🆕 Insert Response:", data, error);

		if (error) {
			console.error("❌ Insert error:", error);
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}

		// ✅ Catch RLS failure (if no rows were inserted)
		if (!data || data.length === 0) {
			console.warn("🚨 RLS blocked insert (no permission)");
			return NextResponse.json({ error: "Forbidden: You do not have permission to add a destination." }, { status: 403 });
		}

		return NextResponse.json({ success: true, inserted: data });
	}

	return NextResponse.json({ success: true});
}
