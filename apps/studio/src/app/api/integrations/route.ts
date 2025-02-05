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

	// Check if integration already exists
	const { data: existingIntegration, error: fetchError } = await supabase
		.from("integrations")
		.select("integration_id")
		.eq("workspace_id", workspaceId)
		.eq("provider_id", providerId)
		.single();

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

	if (encryptionError)
		return NextResponse.json({ error: "Failed to encrypt credentials" }, { status: 500 });

	if (existingIntegration) {
		// Update existing integration
		const { error } = await supabase
			.from("integrations")
			.update({
				enabled,
				encrypted_credentials: encryptedCredentials,
				updated_at: new Date().toISOString(),
			})
			.eq("integration_id", existingIntegration.integration_id);
		if (error) {
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}
	} else {
		// Insert new integration
		const { error } = await supabase.from("integrations").insert([
			{
				workspace_id: workspaceId,
				provider_id: providerId,
				enabled,
				encrypted_credentials: encryptedCredentials,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			},
		]);
		if (error) {
			return NextResponse.json({ error: "Failed to save credentials" }, { status: 500 });
		}
	}

	return NextResponse.json({ success: true });
}
