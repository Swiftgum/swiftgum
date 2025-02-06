"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "react-hot-toast";

type WebhookParams = {
	type: string;
	webhook: {
		url: string;
	};
};

interface OAuthSettingsPanelProps {
	webhookParams: WebhookParams;
	workspaceId: string;
	destinationId: string;
}

export default function WebhookModule({
	webhookParams,
	workspaceId,
	destinationId,
}: OAuthSettingsPanelProps) {
	const [webhookkURL, setWebhookkURL] = useState(webhookParams.webhook.url);
	const [originalWebhookURL, setOriginalWebhookURL] = useState(webhookParams.webhook.url);
	const [isSaving, setIsSaving] = useState(false);

	const isModified = webhookkURL !== originalWebhookURL;

	// Handle Save
	const handleSave = async () => {
		setIsSaving(true);
		try {
			const response = await fetch("/api/destinations", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					workspaceId,
					destinationId,
					dataToEncrypt: { type: webhookParams.type, webhook: { url: webhookkURL } },
				}),
			});

			if (!response.ok) throw new Error("Failed to update workspace");

			// Show success toast notification
			toast.success("Successfully saved settings!");

			// Sync UI state on success
			setOriginalWebhookURL(webhookkURL);
		} catch (error) {
			console.error("Error updating workspace:", error);
			toast.error("Failed to save settings.");
		} finally {
			setIsSaving(false);
		}
	};

	// Handle Cancel
	const handleCancel = () => {
		setWebhookkURL(originalWebhookURL);
	};

	return (
		<div className="overflow-y-auto">
			<Card className="bg-white text-zinc-900 border border-gray-300 w-full shadow-md !rounded-none">
				<CardContent className="space-y-6 p-5 bg-gray-50 max-h-[calc(100vh-150px)] overflow-y-auto">
					<div className="flex flex-col gap-2">
						<div className="w-1/2 flex items-start gap-3">
							<div>
								<span className="text-sm text-zinc-700 font-bold">Webhook Configuration</span>
							</div>
						</div>
						<div className="flex flex-col w-1/2 gap-5">
							<div>
								<label htmlFor="clientId" className="block text-sm font-medium text-zinc-700 mb-px">
									Webhook URL
								</label>
								<Input
									id="clientId"
									value={webhookkURL}
									onChange={(e) => setWebhookkURL(e.target.value)}
									placeholder="Project name"
								/>
							</div>
						</div>
					</div>
					<div className="flex justify-end mt-4 gap-3">
						<Button
							variant="outline"
							disabled={!isModified || isSaving}
							onClick={handleCancel}
							className={!isModified ? "opacity-50 !cursor-default" : ""}
						>
							Cancel
						</Button>
						<Button
							variant="default"
							onClick={handleSave}
							disabled={!isModified || isSaving}
							className={!isModified ? "opacity-50 !cursor-default" : ""}
						>
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
