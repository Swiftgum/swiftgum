import { GATEWAY_PAYLOAD_PARAM, SESSION_ID_PARAM, claimSession } from "@/utils/portal/session";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
	const { searchParams } = request.nextUrl;

	const sessionId = searchParams.get(SESSION_ID_PARAM);
	const payload = searchParams.get(GATEWAY_PAYLOAD_PARAM);

	if (!sessionId || !payload) {
		throw new Error("Invalid request");
	}

	await claimSession({
		sessionId,
		signedPayload: payload,
	});

	const forwardedProtocol = request.headers.get("x-forwarded-proto");
	const forwardedHost = request.headers.get("x-forwarded-host");

	const url = new URL(
		"/portal",
		forwardedProtocol ? `${forwardedProtocol}://${forwardedHost}` : request.url,
	);

	url.searchParams.set(SESSION_ID_PARAM, sessionId);

	return NextResponse.redirect(url);
};
