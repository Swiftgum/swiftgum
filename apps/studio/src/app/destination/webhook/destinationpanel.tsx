"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import WebhookModule from "./webhookmodule";

type Destination = {
	created_at: string | null;
	decrypted_destination_params: {
		type: (string | null) & (JSON | null);
	} | null;
	destination_id: string | null;
	encrypted_destination_params: string | null;
	updated_at: string | null;
	workspace_id: string | null;
};

type WebhookParams = {
	type: string;
	webhook: {
		url: string;
	};
};

interface OAuthSettingsPanelProps {
	destinations: Destination[];
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
