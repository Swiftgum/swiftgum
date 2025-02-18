import { portalSession } from "@knowledgex/shared/interfaces";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
	const body = await request.json();
	const { data, error } = portalSession.safeParse(body);

	if (error) {
		console.error(error);

		return NextResponse.json({ error: "Invalid request payload", details: error }, { status: 400 });
	}

	return NextResponse.json(data);
}
