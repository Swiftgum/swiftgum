import { createSession, signSession } from "@/utils/portal/session";
import { portalSession } from "@knowledgex/shared/interfaces";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json();
	const { data, error } = portalSession.safeParse(body);

	if (error) {
		console.error(error);

		return NextResponse.json({ error: "Invalid request payload", details: error }, { status: 400 });
	}

	const session = await createSession({
		configuration: data.configuration,
		endUserForeignId: data.uniqueUserId,
		workspaceId: "00000000-0000-0000-0000-000000000000",
	});

	const url = await signSession({
		session,
		workspaceId: "00000000-0000-0000-0000-000000000000",
	});

	return NextResponse.json(url);
}
