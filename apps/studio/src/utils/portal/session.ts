import { hash, randomUUID } from "node:crypto";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { z } from "zod";
import type { Database } from "../supabase/types";

const cookieName = (cookieHash: string) => `kx:ps:${cookieHash}`;
export const SESSION_ID_PARAM = "sid";

export const portalSessionConfiguration = z.object({
	display_name: z.string().optional(),
	return_url: z.string().optional(),
});

export type PortalSessionConfiguration = z.infer<typeof portalSessionConfiguration>;

export type PortalSession = Database["public"]["Tables"]["portal_sessions"]["Row"] & {
	configuration: PortalSessionConfiguration;
};

export const createSession = async ({
	endUserForeignId,
	workspaceId,
	configuration,
	// TODO: Add session signature
}: {
	endUserForeignId: string;
	workspaceId: string;
	configuration?: PortalSessionConfiguration;
}) => {
	"use server";

	const cookieStore = await cookies();

	const supabase = await createClient();

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

	const cookieNonce = randomUUID();
	const cookieHash = hash("sha256", cookieNonce);

	const { data: session, error: sessionError } = await supabase
		.from("portal_sessions")
		.insert({
			end_user_id: endUser.end_user_id,
			workspace_id: workspace.workspace_id,
			cookie_hash: cookieHash,
			configuration: Object.assign({}, configuration),
		})
		.select("*")
		.single();

	if (sessionError) {
		throw new Error(sessionError.message);
	}

	cookieStore.set({
		name: cookieName(session.portal_session_id),
		value: cookieNonce,
		expires: new Date(session.expires_at),
		path: "/",
		httpOnly: true,
		sameSite: "lax",
	});

	return session as unknown as PortalSession;
};

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

	const supabase = await createClient();

	const { data: session, error: sessionError } = await supabase
		.from("valid_portal_sessions")
		.select("*")
		.eq("portal_session_id", sessionId)
		.eq("cookie_hash", hash("sha256", cookieNonce.value))
		.single();

	if (sessionError) {
		throw new Error(sessionError.message);
	}

	return session as unknown as PortalSession;
};

export const getPagePortalSession = async ({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
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
	const { searchParams } = request.nextUrl;
	return getPagePortalSession({
		searchParams: Promise.resolve(Object.fromEntries(searchParams.entries())),
	});
};
