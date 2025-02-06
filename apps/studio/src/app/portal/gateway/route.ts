import { SESSION_ID_PARAM, createSession } from "@/utils/portal/session";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	const session = await createSession({
		endUserForeignId: "123",
		workspaceId: "00000000-0000-0000-0000-000000000000",
		configuration: {
			display_name: "John Doe",
		},
	});

	const url = new URL("/portal", request.url);

	url.searchParams.set(SESSION_ID_PARAM, session.portal_session_id);

	return NextResponse.redirect(url);
};
