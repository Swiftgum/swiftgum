"use server";

import { log } from "@/utils/log";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWorkspaceSettings() {
	const supabase = await createClient();

	const { data: user } = await supabase.auth.getUser();
	if (!user.user) {
		throw new Error("Not authenticated");
	}

	const { data: workspace, error } = await supabase
		.from("workspace")
		.select("workspace_id, label, app_name, app_icon")
		.eq("owner_user_id", user.user.id)
		.single();

	if (error || !workspace?.workspace_id || !workspace?.label) {
		throw new Error("Failed to fetch workspace settings");
	}

	return workspace;
}

export async function updateWorkspaceSettings({
	workspaceId,
	label,
	appName,
	appIcon,
}: {
	workspaceId: string;
	label: string;
	appName?: string;
	appIcon?: string | null;
}) {
	const supabase = await createClient();

	// Get current workspace data for logging
	const { data: currentWorkspace } = await supabase
		.from("workspace")
		.select("label, app_name, app_icon")
		.eq("workspace_id", workspaceId)
		.single();

	// Validate base64 image if provided
	if (appIcon && appIcon !== currentWorkspace?.app_icon) {
		const isValidBase64Image = appIcon.match(
			/^data:image\/(jpeg|png|svg\+xml);base64,[A-Za-z0-9+/=]+$/,
		);
		const sizeInBytes = Buffer.from(appIcon.split(",")[1], "base64").length;

		if (!isValidBase64Image) {
			throw new Error("Invalid image format. Please use JPEG, PNG, or SVG.");
		}

		if (sizeInBytes > 10485760) {
			// 10MB
			throw new Error("Image size must be less than 10MB.");
		}
	}

	const { error } = await supabase
		.from("workspace")
		.update({
			label,
			app_name: appName,
			...(appIcon !== undefined && { app_icon: appIcon }),
		})
		.eq("workspace_id", workspaceId);

	if (error) throw new Error(error.message);

	// Log the configuration change
	void log({
		workspace_id: workspaceId,
		level: "info",
		type: "workspace",
		name: "configuration:changed",
		metadata: {
			changes: {
				label: {
					from: currentWorkspace?.label,
					to: label,
				},
				app_name: {
					from: currentWorkspace?.app_name,
					to: appName,
				},
				app_icon_updated: appIcon !== currentWorkspace?.app_icon,
			},
		},
		private: false,
	});

	revalidatePath("/admin/settings");
}
