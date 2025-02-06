import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
	const supabase = await createClient();
	const { workspaceId, label } = await req.json();

	const {
		data: { user },
		error: authError,
	} = await supabase.auth.getUser();
	if (authError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("workspace")
		.update({ label })
		.eq("workspace_id", workspaceId)
		.eq("owner_user_id", user.id)
		.select();

	// ✅ Handle RLS silently blocking updates (no rows affected)
	if (error) {
		return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
	}
	if (!data || data.length === 0) {
		return NextResponse.json(
			{ error: "Update failed: no matching row found or insufficient permissions" },
			{ status: 403 },
		);
	}

	return NextResponse.json({ success: true });
}
