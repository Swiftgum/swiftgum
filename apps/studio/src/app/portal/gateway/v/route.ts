import { getSession } from "@/utils/portal/session";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
	const { searchParams } = request.nextUrl;

	const sessionId = searchParams.get("session_id");

	if (!sessionId) {
		return NextResponse.json({ error: "Missing session_id parameter" }, { status: 400 });
	}

	const session = await getSession({ sessionId });

	return NextResponse.json({ done: true, session });
};
