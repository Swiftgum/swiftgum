"use client";
import type { DecryptedDestination } from "@knowledgex/shared/types/overload";

import WebhookModule from "./webhookmodule";

type WebhookParams = {
	type: string;
	webhook: {
		url: string;
	};
};

interface OAuthSettingsPanelProps {
	destinations: DecryptedDestination[];
	workspaceId: string;
}

export default function DestionationPanel({ destinations, workspaceId }: OAuthSettingsPanelProps) {
	let webhookParams: WebhookParams = {
		type: "webhook",
		webhook: {
			url: "",
		},
	};
	let webhookDestinationId = "";

	destinations.map((destination) => {
		switch (destination.decrypted_destination_params.type) {
			case "webhook": {
				const params = destination.decrypted_destination_params;
				if (params && "webhook" in params) {
					// Type guard to check for 'webhook'
					webhookParams = params as WebhookParams;
					webhookDestinationId = destination.destination_id ?? "";
				} else {
					console.error("Invalid webhook parameters", params);
				}
			}
		}
	});

	return (
		<WebhookModule
			workspaceId={workspaceId}
			webhookParams={webhookParams}
			destinationId={webhookDestinationId}
		/>
	);
}
