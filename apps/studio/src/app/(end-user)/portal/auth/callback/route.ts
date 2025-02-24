import { queueForIndexing } from "@/utils/integrations/queue";
import { claimAuthSession, getIntegrationCredentials } from "@/utils/integrations/session";
import { saveIntegrationToken } from "@/utils/integrations/token";
import { log } from "@/utils/log";
import { createServerOnlyClient } from "@/utils/supabase/server";
import type { IntegrationCredentials } from "@knowledgex/shared/interfaces";
import { resourceUri } from "@knowledgex/shared/log";
import type { Database } from "@knowledgex/shared/types/database-server";
import { type NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

	if (!session.integration_id || !session.end_user_id) {
		throw new Error("Session is missing integration_id or end_user_id");
	}

	if (request.nextUrl.searchParams.get("error")) {
		const redirect = new URL(session.auth_session.redirect);

		redirect.searchParams.set("error", request.nextUrl.searchParams.get("error") || "");

		void log({
			workspace_id: session.auth_session.workspace_id,
			end_user_id: session.end_user_id,
			level: "error",
			type: "portal-auth-session",
			name: "error",
			id: {
				portal_session: session.auth_session.portal_session_id,
				auth_session: session.auth_session_id,
				end_user: session.end_user_id,
			},
			metadata: {
				error: request.nextUrl.searchParams.get("error") || "",
			},
		});

		return NextResponse.redirect(redirect);
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

				const tokenset = {
					type: "oauth2" as const,
					oauth2: {
						access_token: tokens.access_token,
						refresh_token: tokens.refresh_token || "",
						expires_in: tokens.expires_in,
						expires_at: tokens.expires_in
							? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
							: undefined,
						scope: session.auth_session.scope,
					},
				};

				// Check for existing token
				const supabase = await createServerOnlyClient();
				const { data: existingToken } = await supabase
					.schema("private")
					.from("tokens")
					.select("*")
					.eq("integration_id", session.integration_id)
					.eq("end_user_id", session.end_user_id)
					.is("revoked_at", null)
					.single();

				let token: Database["private"]["Tables"]["tokens"]["Row"];
				if (existingToken) {
					// Update existing token
					const encryptedTokenSet = await supabase.schema("private").rpc("encrypt_tokenset", {
						p_workspace_id: existingToken.workspace_id,
						p_tokenset: tokenset,
					});

					if (encryptedTokenSet.error) throw encryptedTokenSet.error;

					const { data: updatedToken, error } = await supabase
						.schema("private")
						.from("tokens")
						.update({
							encrypted_tokenset: encryptedTokenSet.data,
							expires_at: tokens.expires_in
								? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
								: undefined,
							refreshed_at: new Date().toISOString(),
						})
						.eq("token_id", existingToken.token_id)
						.select("*")
						.single();

					if (error) throw error;
					token = updatedToken;
				} else {
					// Create new token
					token = await saveIntegrationToken({
						integration_id: session.integration_id,
						end_user_id: session.end_user_id,
						expires_at: tokens.expires_in
							? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
							: undefined,
						tokenset,
					});
				}

				await queueForIndexing({
					workspaceId: token.workspace_id,
					endUserId: token.end_user_id,
					parentTaskIds: resourceUri({
						integration: token.integration_id,
						token: token.token_id,
					}),
					task: {
						provider: "google:drive",
						payload: {
							tokenId: token.token_id,
						},
					},
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
