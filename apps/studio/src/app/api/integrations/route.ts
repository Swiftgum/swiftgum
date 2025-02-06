import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
	const supabase = await createClient();
	const { workspaceId, providerId, clientId, clientSecret, enabled } = await req.json();

	// Validate inputs
	if (!clientId || !clientSecret) {
		return NextResponse.json(
			{
				error: "OAuth Client ID and Client Secret are required.",
				errors: {
					clientId: !clientId ? "Client ID is required" : null,
					clientSecret: !clientSecret ? "Client Secret is required" : null,
				},
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

	console.log("🔍 Checking existing integration...");
	const { data: existingIntegration, error: fetchError } = await supabase
		.from("integrations")
		.select("integration_id")
		.eq("workspace_id", workspaceId)
		.eq("provider_id", providerId)
		.single();

	if (fetchError && fetchError.code !== "PGRST116") {
		console.error("❌ Fetch error:", fetchError);
		return NextResponse.json({ error: "Failed to fetch existing integration" }, { status: 500 });
	}

	console.log("🔒 Encrypting credentials...");
	const { data: encryptedCredentials, error: encryptionError } = await supabase.rpc(
		"encrypt_integration_credentials",
		{
			p_workspace_id: workspaceId,
			p_credentials: {
				type: "oauth2",
				oauth2: {
					url: "https://accounts.google.com/.well-known/openid-configuration",
					client_id: clientId,
					client_secret: clientSecret,
				},
			},
		},
	);

	if (encryptionError) {
		console.error("❌ Encryption error:", encryptionError);
		return NextResponse.json({ error: "Failed to encrypt credentials" }, { status: 500 });
	}

	if (existingIntegration) {
		const { data, error } = await supabase
			.from("integrations")
			.update({
				enabled,
				encrypted_credentials: encryptedCredentials,
				updated_at: new Date().toISOString(),
			})
			.eq("integration_id", existingIntegration.integration_id)
			.select();

		if (error) {
			console.error("❌ Update error:", error);
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}

		// ✅ Detect RLS failure (if no rows updated)
		if (!data || data.length === 0) {
			console.warn("🚨 RLS blocked update (no matching row or insufficient permissions)");
			return NextResponse.json(
				{ error: "Forbidden: You do not have permission to update this integration." },
				{ status: 403 },
			);
		}

		NextResponse.json({ success: true, updated: data });
	} else {
		const { data, error } = await supabase
			.from("integrations")
			.insert([
				{
					workspace_id: workspaceId,
					provider_id: providerId,
					enabled,
					encrypted_credentials: encryptedCredentials,
					created_at: new Date().toISOString(),
					updated_at: new Date().toISOString(),
				},
			])
			.select(); // ✅ Ensures affected rows are returned

		console.log("🆕 Insert Response:", data, error);

		if (error) {
			console.error("❌ Insert error:", error);
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}

		// ✅ Detect RLS failure (if no rows inserted)
		if (!data || data.length === 0) {
			console.warn("🚨 RLS blocked insert (no permission)");
			return NextResponse.json(
				{ error: "Forbidden: You do not have permission to add an integration." },
				{ status: 403 },
			);
		}
		NextResponse.json({ success: true, inserted: data });
	}

	return NextResponse.json({ success: true });
}
