"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DecryptedDestination } from "@knowledgex/shared/types/overload";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateDestination } from "./actions";

interface DestinationFormProps {
	destinations: DecryptedDestination[];
}

export function DestinationForm({ destinations }: DestinationFormProps) {
	const webhook = destinations.find((d) => d.decrypted_destination_params.type === "webhook");
	const [url, setUrl] = useState(webhook?.decrypted_destination_params.webhook?.url ?? "");
	const [isSaving, setIsSaving] = useState(false);

	const router = useRouter();

	const handleSave = async () => {
		if (!url || url === webhook?.decrypted_destination_params.webhook?.url) return;

		setIsSaving(true);
		try {
			await updateDestination({
				destinationId: webhook?.destination_id ?? "",
				dataToEncrypt: { type: "webhook", webhook: { url } },
			});
			toast.success("Webhook settings saved");
			router.refresh();
		} catch (error) {
			toast.error("Failed to save webhook settings");
			console.error(error);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card>
			<CardContent className="space-y-6 p-6">
				<div>
					<h3 className="text-lg font-semibold text-zinc-900">Webhook Configuration</h3>
					<p className="text-sm text-zinc-500">Configure your webhook endpoint for data delivery</p>
				</div>

				<div className="max-w-2xl space-y-2">
					<label htmlFor="webhookUrl" className="text-sm font-medium text-zinc-700">
						Webhook URL
					</label>
					<Input
						id="webhookUrl"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://your-webhook-endpoint.com/path"
					/>
				</div>

				<div className="flex justify-end">
					<Button
						onClick={handleSave}
						disabled={
							isSaving || !url || url === webhook?.decrypted_destination_params.webhook?.url
						}
					>
						{isSaving ? "Saving..." : "Save"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
