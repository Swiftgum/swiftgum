import { authenticateApiKey } from "@/utils/auth/api-key";
import { createSession, signSession } from "@/utils/portal/session";
import { portalSession } from "@knowledgex/shared/interfaces";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { data, error } = portalSession.safeParse(body);

	const workspace = await authenticateApiKey(request);

	if (error) {
		console.error(error);

		return NextResponse.json({ error: "Invalid request payload", details: error }, { status: 400 });
	}

	const session = await createSession({
		configuration: data.configuration,
		endUserForeignId: data.uniqueUserId,
		workspaceId: workspace.workspace_id,
	});

	const url = await signSession({
		session,
		workspaceId: workspace.workspace_id,
	});

	return NextResponse.json(url);
}
