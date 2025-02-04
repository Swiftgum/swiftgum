import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// export async function GET(req: Request) {
// 	const supabase = await createClient();
// 	const {
// 		data: { user },
// 		error: authError,
// 	} = await supabase.auth.getUser();

// 	if (authError || !user) {
// 		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// 	}

// 	const { data: workspace, error } = await supabase
// 		.from("workspace")
// 		.select("workspace_id, label")
// 		.eq("owner_user_id", user.id)
// 		.single();

// 	if (error) {
// 		return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 });
// 	}

// 	return NextResponse.json(workspace);
// }

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

	const { error } = await supabase
		.from("workspace")
		.update({ label })
		.eq("workspace_id", workspaceId)
		.eq("owner_user_id", user.id);

	if (error) {
		return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
