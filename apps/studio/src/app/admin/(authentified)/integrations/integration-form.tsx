"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as RevealInput from "@/components/ui/reveal-input";
import { Switch } from "@/components/ui/switch";
import type { DecryptedIntegration, Provider } from "@knowledgex/shared/types/overload";
import { useState } from "react";
import { saveIntegration } from "./actions";

interface IntegrationFormProps {
	provider: Provider;
	integration: DecryptedIntegration | null;
}

export function IntegrationForm({ provider, integration }: IntegrationFormProps) {
	const [isEnabled, setIsEnabled] = useState(integration?.enabled ?? false);
	const [clientId, setClientId] = useState(
		integration?.decrypted_credentials?.oauth2?.client_id ?? "",
	);
	const [clientSecret, setClientSecret] = useState(
		integration?.decrypted_credentials?.oauth2?.client_secret ?? "",
	);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);
			await saveIntegration({
				providerId: provider.provider_id,
				enabled: isEnabled,
				...((!integration || (clientId && clientSecret)) && {
					credentials: {
						type: "oauth2",
						oauth2: {
							client_id: clientId,
							client_secret: clientSecret,
							url: provider.metadata?.oauth2?.url as string,
						},
					},
				}),
			});
		} catch (error) {
			console.error("Failed to save integration:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Only show OAuth2 form for OAuth2 providers
	if (provider.metadata?.type !== "oauth2") {
		return <div className="text-sm text-gray-500">This provider type is not yet supported.</div>;
	}

	return (
		<div className="space-y-6">
			{/* Status Section */}
			<div className="flex items-center justify-between">
				<div>
					<h4 className="font-medium text-zinc-700">Status</h4>
					<p className="text-sm text-gray-500">
						{isEnabled ? "This integration is active" : "This integration is not active"}
					</p>
				</div>
				<Switch checked={isEnabled} onCheckedChange={setIsEnabled} disabled={isLoading} />
			</div>

			{/* OAuth2 Credentials Section */}
			<div>
				<h4 className="font-medium text-zinc-700 mb-4">OAuth2 Credentials</h4>
				<div className="grid gap-4">
					<div>
						<label
							htmlFor={`client-id-${provider.provider_id}`}
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Client ID
						</label>
						<Input
							id={`client-id-${provider.provider_id}`}
							type="text"
							placeholder={integration ? "Leave blank to keep existing" : "Enter client ID"}
							value={clientId}
							onChange={(e) => setClientId(e.target.value)}
							disabled={isLoading}
							className="font-mono"
						/>
						{integration?.decrypted_credentials && !clientId && (
							<p className="text-xs text-gray-500 mt-1">Using existing client ID</p>
						)}
					</div>
					<div>
						<label
							htmlFor={`client-secret-${provider.provider_id}`}
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Client Secret
						</label>
						<RevealInput.Root>
							<RevealInput.Input asChild>
								<Input
									id={`client-secret-${provider.provider_id}`}
									placeholder={integration ? "Leave blank to keep existing" : "Enter client secret"}
									value={clientSecret}
									onChange={(e) => setClientSecret(e.target.value)}
									disabled={isLoading}
									className="font-mono"
								/>
							</RevealInput.Input>
							<RevealInput.Reveal asChild>
								<Button type="button" variant="outline" disabled={isLoading} />
							</RevealInput.Reveal>
						</RevealInput.Root>
						{integration?.decrypted_credentials && !clientSecret && (
							<p className="text-xs text-gray-500 mt-1">Using existing client secret</p>
						)}
					</div>
				</div>
			</div>

			{/* Actions Section */}
			<div className="flex justify-end">
				<Button
					variant="default"
					className="w-full sm:w-auto"
					onClick={handleSubmit}
					disabled={isLoading}
				>
					{isLoading ? "Saving..." : integration ? "Update Integration" : "Configure Integration"}
				</Button>
			</div>
		</div>
	);
}
