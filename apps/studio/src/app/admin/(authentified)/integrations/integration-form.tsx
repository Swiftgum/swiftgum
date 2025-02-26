"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as RevealInput from "@/components/ui/reveal-input";
import { Switch } from "@/components/ui/switch";
import { getURL } from "@/utils/helpers";
import type { AuthIntegrationCredential } from "@knowledgex/shared/providers/auth";
import type { DecryptedIntegration, Provider } from "@knowledgex/shared/types/overload";
import { useState } from "react";
import { saveIntegration } from "./actions";

interface IntegrationFormProps {
	provider: Provider;
	integration: DecryptedIntegration | null;
	authProviderSchemaShape: {
		properties: {
			data: {
				properties: {
					[key: string]: {
						type: string;
						description?: string;
					};
				};
			};
		};
	};
}

export function IntegrationForm({
	provider,
	integration,
	authProviderSchemaShape,
}: IntegrationFormProps) {
	const [isEnabled, setIsEnabled] = useState(integration?.enabled ?? false);
	const [formValues, setFormValues] = useState<{
		[key: string]: string;
	}>(() => ({
		...(integration?.decrypted_credentials?.data ?? {}),
	}));
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsLoading(true);

			await saveIntegration({
				providerId: provider.provider_id,
				providerIdentifier: provider.identifier,
				enabled: isEnabled,
				credentials: formValues as unknown as AuthIntegrationCredential,
			});
		} catch (error) {
			console.error("Failed to save integration:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fields = Object.entries(authProviderSchemaShape.properties.data.properties);

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

			<div className="flex flex-col gap-2">
				<label htmlFor="callback-url" className="text-sm font-medium text-gray-700">
					Callback URL
				</label>
				<Input
					type="text"
					className="font-mono bg-gray-100"
					readOnly
					value={getURL("/portal/auth/callback")}
				/>
			</div>

			{/* Dynamic Fields Section */}
			<div>
				<h4 className="font-medium text-zinc-700 mb-4">OAuth2 Credentials</h4>
				<form autoComplete="off" className="grid gap-4">
					{fields.map(([fieldName, field]) => {
						const isSecret = field.description?.includes("@secret");

						const value = formValues[fieldName as keyof typeof formValues] || "";

						const name = (field.description ?? fieldName).replace("@secret", "").trim();

						const InputComponent = isSecret ? (
							<RevealInput.Root key={fieldName}>
								<RevealInput.Input asChild>
									<Input
										id={`field-${fieldName}`}
										placeholder={
											integration ? "Leave blank to keep existing" : `Enter ${fieldName}`
										}
										value={value}
										onChange={(e) =>
											setFormValues((prev) => ({
												...prev,
												[fieldName]: e.target.value,
											}))
										}
										disabled={isLoading}
										className="font-mono"
										type="text"
									/>
								</RevealInput.Input>
								<RevealInput.Reveal asChild>
									<Button type="button" variant="outline" disabled={isLoading} />
								</RevealInput.Reveal>
							</RevealInput.Root>
						) : (
							<Input
								key={fieldName}
								id={`field-${fieldName}`}
								type="text"
								placeholder={integration ? "Leave blank to keep existing" : `Enter ${fieldName}`}
								value={value}
								onChange={(e) =>
									setFormValues((prev) => ({
										...prev,
										[fieldName]: e.target.value,
									}))
								}
								disabled={isLoading}
								className="font-mono"
							/>
						);

						return (
							<div key={fieldName}>
								<label
									htmlFor={`field-${fieldName}`}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									{name}
								</label>
								{InputComponent}
							</div>
						);
					})}
				</form>
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
