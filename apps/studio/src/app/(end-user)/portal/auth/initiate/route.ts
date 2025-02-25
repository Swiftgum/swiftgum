import { createAuthSession, getIntegrationCredentials } from "@/utils/integrations/session";
import { getRoutePortalSession } from "@/utils/portal/session";
import { getAuthProvider } from "@knowledgex/shared/providers/auth";
import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const integrationId = searchParams.get("integration_id");

	if (!integrationId) {
		return NextResponse.json({
			error: "Missing integration_id parameter",
		});
	}

	const { session } = await getRoutePortalSession(request);

	const { integrationCredentials, provider } = await getIntegrationCredentials(integrationId);

	const authProvider = getAuthProvider(provider.identifier);

	// Generate a uuid using node crypto
	const sessionId = crypto.randomUUID();

	const { session: authSessionPayload, nextUrl } = await authProvider.initiate({
		configuration: integrationCredentials,
		callbackUrl: new URL("/portal/auth/callback", request.url),
		sessionId,
	});

	await createAuthSession({
		auth_session_id: sessionId,
		end_user_id: session.end_user_id,
		integration_id: integrationId,
		auth_session: {
			context: {
				workspaceId: session.workspace_id,
				endUserId: session.end_user_id,
				portalSessionId: session.portal_session_id,
				integrationId,
			},
			...authSessionPayload,
		},
	});

	return NextResponse.redirect(nextUrl);
}
