import { getURL } from "@/utils/helpers";
import { log } from "@/utils/log";
import { createServerOnlyClient } from "@/utils/supabase/server";
import {
	type PortalSessionConfiguration,
	portalSessionConfiguration,
} from "@knowledgex/shared/interfaces";
import type { PortalSession } from "@knowledgex/shared/types/overload";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const cookieName = (sessionId: string) => `kx:ps:${sessionId}`;
export const SESSION_ID_PARAM = "sid";
export const GATEWAY_PAYLOAD_PARAM = "pld";

export const createSession = async ({
	endUserForeignId,
	workspaceId,
	configuration,
}: {
	endUserForeignId: string;
	workspaceId: string;
	configuration: PortalSessionConfiguration;
}) => {
	"use server";

	const supabase = await createServerOnlyClient();

	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace")
		.select("*")
		.eq("workspace_id", workspaceId)
		.single();

	if (workspaceError) {
		throw new Error(workspaceError.message);
	}

	const { data: endUser, error: endUserError } = await supabase
		.from("end_users")
		.upsert(
			{
				foreign_id: endUserForeignId,
				workspace_id: workspaceId,
			},
			{
				onConflict: "foreign_id, workspace_id",
				ignoreDuplicates: false,
			},
		)
		.select("*")
		.single();

	if (endUserError) {
		throw new Error(endUserError.message);
	}

	portalSessionConfiguration.parse(configuration);

	const { data: session, error: sessionError } = await supabase
		.schema("private")
		.from("portal_sessions")
		.insert({
			end_user_id: endUser.end_user_id,
			workspace_id: workspace.workspace_id,
			cookie_hash: null,
			configuration: configuration,
		})
		.select("*")
		.single();

	if (sessionError) {
		throw new Error(sessionError.message);
	}

	void log({
		workspace_id: workspace.workspace_id,
		end_user_id: endUser.end_user_id,
		level: "info",
		type: "portal-session",
		name: "created",
		metadata: {
			configuration,
			expiresAt: session.expires_at,
		},
		id: {
			portal_session: session.portal_session_id,
			end_user: endUser.end_user_id,
		},
		private: false,
	});

	return session as unknown as PortalSession;
};

export const signSession = async ({
	session,
	workspaceId,
}: {
	session: PortalSession;
	workspaceId: string;
}) => {
	"use server";

	const supabase = await createServerOnlyClient();

	const { data: payload, error: signedUrlError } = await supabase
		.schema("private")
		.rpc("sign_portal_session", {
			p_portal_session_id: session.portal_session_id,
			p_workspace_id: workspaceId,
		});

	if (signedUrlError) {
		throw new Error(signedUrlError.message);
	}

	const url = new URL(getURL("/portal/gateway"));
	url.searchParams.set(SESSION_ID_PARAM, session.portal_session_id);
	url.searchParams.set(GATEWAY_PAYLOAD_PARAM, payload);

	void log({
		workspace_id: session.workspace_id,
		end_user_id: session.end_user_id,
		level: "verbose",
		type: "portal-session",
		name: "signed",
		id: {
			portal_session: session.portal_session_id,
			end_user: session.end_user_id,
		},
	});

	return url.toString();
};

/**
 * Claim a session from a signed payload. The cookie will be set automatically.
 *
 * @throws {Error} If the session is not found or the cookie hash is invalid.
 */
export const claimSession = async ({
	sessionId,
	signedPayload,
}: {
	sessionId: string;
	signedPayload: string;
}) => {
	"use server";

	const supabase = await createServerOnlyClient();

	const { data: claimInformation, error: claimedSessionError } = await supabase
		.schema("private")
		.rpc("claim_portal_session", {
			p_portal_session_id: sessionId,
			p_signed_payload: signedPayload,
		});

	if (claimedSessionError || !claimInformation) {
		throw new Error(claimedSessionError.message);
	}

	if (!claimInformation.cookie_nonce || !claimInformation.expires_at) {
		throw new Error("Invalid claim information");
	}

	const { data: session, error: sessionError } = await supabase
		.schema("private")
		.from("portal_sessions")
		.select("*")
		.eq("portal_session_id", sessionId)
		.single();

	if (sessionError) {
		throw new Error(sessionError.message);
	}

	void log({
		workspace_id: session.workspace_id,
		end_user_id: session.end_user_id,
		level: "info",
		type: "portal-session",
		name: "claimed",
		id: {
			portal_session: session.portal_session_id,
			end_user: session.end_user_id,
		},
		private: false,
	});

	const cookieStore = await cookies();
	cookieStore.set({
		name: cookieName(sessionId),
		value: claimInformation.cookie_nonce,
		expires: new Date(claimInformation.expires_at),
		path: "/",
		httpOnly: true,
		sameSite: "lax",
	});

	return {
		success: true,
	};
};

/**
 * Retrieve a session, validating both the session id and the cookie hash. The cookie hash is automatically retrieved from the cookie store.
 *
 * @throws {Error} If the session is not found or the cookie hash is invalid.
 */
export const getSession = async ({
	sessionId,
}: {
	sessionId: string;
}) => {
	"use server";

	const cookieStore = await cookies();
	const name = cookieName(sessionId);

	const cookieNonce = cookieStore.get(name);

	if (!cookieNonce) {
		throw new Error("Session not found");
	}

	const supabase = await createServerOnlyClient();

	const { data: session, error: sessionError } = await supabase
		.schema("private")
		.rpc("get_portal_session", {
			p_portal_session_id: sessionId,
			p_cookie_nonce: cookieNonce.value,
		});

	if (sessionError) {
		throw new Error(sessionError.message);
	}

	void log({
		workspace_id: session.workspace_id,
		end_user_id: session.end_user_id,
		level: "verbose",
		type: "portal-session",
		name: "retrieved",
		id: {
			portal_session: session.portal_session_id,
			end_user: session.end_user_id,
		},
		private: false,
	});

	portalSessionConfiguration.parse(session.configuration);

	return session as unknown as PortalSession;
};

/**
 * Utility function to get the portal session from the page.
 */

export const getPagePortalSession = async ({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
	"use server";

	const params = await searchParams;
	const sessionId = params[SESSION_ID_PARAM];

	if (!sessionId) {
		throw new Error("Session ID not found");
	}

	if (Array.isArray(sessionId)) {
		throw new Error("Session ID is an array");
	}

	const session = await getSession({ sessionId });

	return {
		session,
		url: (url: string | URL) => {
			const DUMMY_URL = "dummy://dummy.dummy/";

			const newUrl = new URL(url, DUMMY_URL);
			newUrl.searchParams.set(SESSION_ID_PARAM, sessionId);

			const newUrlString = newUrl.toString();

			if (newUrlString.startsWith(DUMMY_URL) && url.toString().startsWith("/")) {
				return newUrlString.replace(DUMMY_URL, "/");
			}

			return newUrlString.replace(DUMMY_URL, "");
		},
	};
};

export const getRoutePortalSession = async (request: NextRequest) => {
	"use server";
	const { searchParams } = request.nextUrl;
	return getPagePortalSession({
		searchParams: Promise.resolve(Object.fromEntries(searchParams.entries())),
	});
};
