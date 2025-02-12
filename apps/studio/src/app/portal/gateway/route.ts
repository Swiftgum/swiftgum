import { SESSION_ID_PARAM, createSession } from "@/utils/portal/session";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
	const session = await createSession({
		endUserForeignId: "123",
		workspaceId: "00000000-0000-0000-0000-000000000000",
		configuration: {
			userDisplay: "John Doe",
			returnUrl: "https://example.com",
			appName: "Dust",
		},
	});

	const forwardedProtocol = request.headers.get("x-forwarded-proto");
	const forwardedHost = request.headers.get("x-forwarded-host");

	const url = new URL(
		"/portal",
		forwardedProtocol ? `${forwardedProtocol}://${forwardedHost}` : request.url,
	);

	console.log(url.toString());

	url.searchParams.set(SESSION_ID_PARAM, session.portal_session_id);

	return NextResponse.redirect(url);
};
