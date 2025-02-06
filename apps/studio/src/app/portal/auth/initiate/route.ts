import { createAuthSession, getIntegrationCredentials } from "@/utils/integrations/session";
import { getRoutePortalSession } from "@/utils/portal/session";
import { type NextRequest, NextResponse } from "next/server";
import * as client from "openid-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	console.log("INITIATE");
	const { searchParams } = request.nextUrl;
	const integrationId = searchParams.get("integration_id");

	if (!integrationId) {
		return NextResponse.json({
			error: "Missing integration_id parameter",
		});
	}

	const { session, url } = await getRoutePortalSession(request);

	const integrationCredentials = await getIntegrationCredentials(integrationId);

	console.log("integrationCredentials", integrationCredentials);
	switch (integrationCredentials.type) {
		case "oauth2": {
			const config = await client.discovery(
				new URL(integrationCredentials.oauth2.url),
				integrationCredentials.oauth2.client_id,
				integrationCredentials.oauth2.client_secret,
			);

			const codeVerifier = client.randomPKCECodeVerifier();
			const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);

			const { auth_session_id } = await createAuthSession({
				end_user_id: session.end_user_id,
				integration_id: integrationId,
				auth_session: {
					type: "oauth2",
					scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
					oauth2: {
						pkce_code_verifier: codeVerifier,
					},
					portal_session_id: session.portal_session_id,
					redirect: url("http://localhost:3000/portal"),
				},
			});

			const redirect = client.buildAuthorizationUrl(config, {
				code_challenge: codeChallenge,
				scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
				redirect_uri: "http://localhost:3000/portal/auth/callback",
				state: auth_session_id,
				code_challenge_method: "S256",
				access_type: "offline",
				prompt: "consent",
			});

			return NextResponse.redirect(redirect);
		}
	}
}
