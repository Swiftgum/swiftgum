import { createSession } from "@/utils/portal/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	const cookieStore = await cookies();

	const { session, cookie } = await createSession({
		endUserForeignId: "123",
		workspaceId: "00000000-0000-0000-0000-000000000000",
	});

	cookieStore.set(cookie);

	const url = new URL("/portal", request.url);

	url.searchParams.set("session_id", session.portal_session_id);

	return NextResponse.redirect(url);
};
