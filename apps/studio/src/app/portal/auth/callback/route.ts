import { queueForIndexing } from "@/utils/integrations/queue";
import {
	type IntegrationCredentials,
	claimAuthSession,
	getIntegrationCredentials,
} from "@/utils/integrations/session";
import { saveIntegrationToken } from "@/utils/integrations/token";
import { NextResponse } from "next/server";
import * as client from "openid-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const url = new URL(request.url);
	const state = url.searchParams.get("state");

	let session: Awaited<ReturnType<typeof claimAuthSession>> | null = null;
	let integrationCredentials: IntegrationCredentials | null = null;

	try {
		session = await claimAuthSession(state || "");
		integrationCredentials = await getIntegrationCredentials(session.integration_id || "");
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

	if (session.auth_session.type !== integrationCredentials.type) {
		return NextResponse.json(
			{
				error: "Session type mismatch",
			},
			{
				status: 400,
			},
		);
	}

	switch (session.auth_session.type) {
		case "oauth2":
			{
				const config = await client.discovery(
					new URL(integrationCredentials.oauth2.url),
					integrationCredentials.oauth2.client_id,
					integrationCredentials.oauth2.client_secret,
				);

				const tokens = await client.authorizationCodeGrant(config, request, {
					pkceCodeVerifier: session.auth_session.oauth2.pkce_code_verifier,
					expectedState: session.auth_session_id || "",
				});

				await saveIntegrationToken({
					integration_id: session.integration_id || "",
					end_user_id: session.end_user_id || "",
					expires_at: tokens.expires_in
						? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
						: undefined,
					tokenset: {
						type: "oauth2",
						oauth2: {
							access_token: tokens.access_token,
							refresh_token: tokens.refresh_token || "",
							expires_in: tokens.expires_in,
							scope: session.auth_session.scope,
						},
					},
				});

				// TODO: move this somewhere else.
				await queueForIndexing({
					type: "google:drive",
					accessToken: tokens.access_token,
				});
			}

			break;
		default:
			return NextResponse.json(
				{
					error: "Unsupported auth session type",
				},
				{
					status: 400,
				},
			);
	}

	if (session.auth_session.redirect) {
		return NextResponse.redirect(session.auth_session.redirect);
	}

	return NextResponse.json({
		session,
		integrationCredentials,
	});
}
