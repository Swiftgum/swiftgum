import { getURL } from "@/utils/helpers";
import { queueForIndexing } from "@/utils/integrations/queue";
import { claimAuthSession, getIntegrationCredentials } from "@/utils/integrations/session";
import { saveIntegrationToken } from "@/utils/integrations/token";
import { resourceUri } from "@knowledgex/shared/log";
import { getAuthProvider } from "@knowledgex/shared/providers/auth";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const state = url.searchParams.get("state");

	let session: Awaited<ReturnType<typeof claimAuthSession>> | null = null;

	try {
		session = await claimAuthSession(state || "");
	} catch (err) {
		console.error(err);

		return NextResponse.json(
			{
				error: "Invalid state",
			},
			{
				status: 400,
			},
		);
	}

	const { integrationCredentials, provider: providerFromDb } = await getIntegrationCredentials(
		session.integration_id as unknown as string,
	);

	const provider = getAuthProvider(providerFromDb.identifier);

	const data = await provider.callback({
		configuration: integrationCredentials,
		authSession: session.auth_session,
		request,
	});

	const token = await saveIntegrationToken({
		end_user_id: session.end_user_id as unknown as string,
		integration_id: session.integration_id as unknown as string,
		tokenset: data,
	});

	await queueForIndexing({
		task: {
			provider: "google:drive",
			payload: {
				tokenId: token.token_id,
			},
		},
		workspaceId: session.auth_session.context.workspaceId,
		endUserId: session.end_user_id as unknown as string,
		parentTaskIds: resourceUri({
			provider: providerFromDb.provider_id,
			end_user: session.end_user_id as unknown as string,
			integration: session.integration_id as unknown as string,
			token: token.token_id,
		}),
	});

	const finalURL = new URL(getURL("/portal"));

	finalURL.searchParams.set("sid", session.auth_session.context.portalSessionId);

	return NextResponse.redirect(finalURL);
}
