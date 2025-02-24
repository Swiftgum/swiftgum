import { PageHeader, PageShell } from "@/components/admin/shell";
import { Card, CardContent } from "@/components/ui/card";
import { getWorkspaceSettings } from "./actions";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
	const settings = await getWorkspaceSettings();

	return (
		<PageShell>
			<PageHeader title="Settings" description="Manage your project settings" />

			<div className="space-y-6">
				<Card>
					<CardContent className="space-y-4 pt-6">
						<div>
							<h2 className="text-lg font-medium text-zinc-700 mb-2">Project Settings</h2>
							<p className="text-sm text-gray-500 mb-4">
								Configure your project name, app name, and app icon.
							</p>
							<SettingsForm
								label={settings.label}
								workspaceId={settings.workspace_id}
								appName={settings.app_name}
								appIcon={settings.app_icon}
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
