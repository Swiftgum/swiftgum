import { hash, randomUUID } from "node:crypto";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "../supabase/types";

const cookieName = (cookieHash: string) => `kx:ps:${cookieHash}`;

export const createSession = async ({
	endUserForeignId,
	workspaceId,
	// TODO: Add session signature
}: {
	endUserForeignId: string;
	workspaceId: string;
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
			configuration: {},
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
		sameSite: "strict",
	});

	return session;
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

	return session as unknown as Database["public"]["Tables"]["portal_sessions"]["Row"];
};
