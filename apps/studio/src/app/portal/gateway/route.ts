import { createSession } from "@/utils/portal/session";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	const session = await createSession({
		endUserForeignId: "123",
		workspaceId: "00000000-0000-0000-0000-000000000000",
	});

	const url = new URL("/portal", request.url);

	url.searchParams.set("session_id", session.portal_session_id);

	return NextResponse.redirect(url);
};
