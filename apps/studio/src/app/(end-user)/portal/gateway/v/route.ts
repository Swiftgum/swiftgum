import { getRoutePortalSession } from "@/utils/portal/session";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
	const { session } = await getRoutePortalSession(request);
	return NextResponse.json({ done: true, session });
};
