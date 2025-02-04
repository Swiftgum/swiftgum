"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronDown, ChevronRight, Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface OAuthProviderProps {
	name: string;
	icon: React.ReactNode;
	callbackUrl: string;
	integration?: {
		integration_id: string;
		enabled: boolean;
		decrypted_credentials: {
			client_secret: string;
			client_id: string;
		};
		created_at: string;
		updated_at: string;
		workspace_id: string;
		provider_id: string;
	} | null; // Now only a single integration or null
	workspaceId: string;
	providerId: string;
}

export default function OAuthProvider({
	name,
	icon,
	callbackUrl,
	integration,
	workspaceId,
	providerId,
}: OAuthProviderProps) {
	const [enabled, setEnabled] = useState(integration?.enabled || false);
	const [clientId, setClientId] = useState(integration?.decrypted_credentials.client_secret || "");
	const [clientSecret, setClientSecret] = useState(
		integration?.decrypted_credentials.client_id || "",
	);
	const [showSecret, setShowSecret] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [copyText, setCopyText] = useState("Copy");
	const [errors, setErrors] = useState<{ clientId?: string; clientSecret?: string }>({});
	const [isSaving, setIsSaving] = useState(false);

	// Store original values to track changes
	const [originalState, setOriginalState] = useState({ enabled, clientId, clientSecret });
	const isModified =
		enabled !== originalState.enabled ||
		clientId !== originalState.clientId ||
		clientSecret !== originalState.clientSecret;

	// Reset to original values
	const handleCancel = () => {
		setEnabled(originalState.enabled);
		setClientId(originalState.clientId);
		setClientSecret(originalState.clientSecret);
	};

	// Handle Copy to Clipboard
	const handleCopy = () => {
		navigator.clipboard.writeText(callbackUrl);
		setCopyText("Copied!");
		setTimeout(() => setCopyText("Copy"), 2000);
	};

	// Handle Save
	const handleSave = async () => {
		setIsSaving(true);
		toast.success("Successfully saved OAuth credentials!");
		setOriginalState({ enabled, clientId, clientSecret });

		try {
			const response = await fetch("/api/integrations", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ workspaceId, providerId, clientId, clientSecret, enabled }),
			});

			if (!response.ok) throw new Error("Error saving OAuth credentials");

			// Show success toast notification
			toast.success("Successfully saved OAuth credentials");

			// Sync UI state on success
			setOriginalState({ enabled, clientId, clientSecret });
		} catch (error) {
			console.error("Error saving OAuth credentials:", error);
			toast.error("Failed to save OAuth credentials.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="overflow-y-auto">
			<Card className="bg-white text-zinc-900 border border-gray-300 w-full shadow-md !rounded-none">
				<CardHeader
					className="flex justify-between flex-row items-center py-2 border-b cursor-pointer hover:bg-gray-100 transition"
					onClick={() => setExpanded(!expanded)}
				>
					<div className="flex items-center gap-3">
						{expanded ? (
							<ChevronDown className="w-5 h-5 text-zinc-500" />
						) : (
							<ChevronRight className="w-5 h-5 text-zinc-500" />
						)}
						{icon}
						<CardTitle className="text-lg font-semibold">{name}</CardTitle>
					</div>
					<div className="flex items-center gap-3 !mt-0">
						<Button
							variant="outline"
							size="sm"
							className={enabled ? "text-green-600 border-green-600 bg-green-100" : "text-zinc-500"}
							disabled
						>
							{enabled ? (
								<>
									<Check color="#16a34a" /> Enabled
								</>
							) : (
								"Disabled"
							)}
						</Button>
					</div>
				</CardHeader>

				{expanded && (
					<CardContent className="space-y-6 p-5 bg-gray-50 max-h-[calc(100vh-150px)] overflow-y-auto">
						<div className="flex items-center gap-3">
							<Switch checked={enabled} onCheckedChange={setEnabled} />
							<span className="text-sm text-zinc-700">{name} enabled</span>
						</div>

						<div>
							<label htmlFor="clientId" className="block text-sm font-medium text-zinc-700 mb-1">
								OAuth Client ID
							</label>
							<Input
								id="clientId"
								value={clientId}
								onChange={(e) => setClientId(e.target.value)}
								placeholder="Enter OAuth Client ID"
								disabled={!enabled}
								className={errors.clientId ? "border-red-500" : ""}
							/>
							{errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
						</div>

						<div>
							<label
								htmlFor="clientSecret"
								className="block text-sm font-medium text-zinc-700 mb-1"
							>
								Client Secret (for OAuth)
							</label>
							<div className="relative">
								<Input
									id="clientSecret"
									type={showSecret ? "text" : "password"}
									value={clientSecret}
									onChange={(e) => setClientSecret(e.target.value)}
									placeholder="Enter OAuth Client Secret"
									disabled={!enabled}
									className={errors.clientSecret ? "border-red-500" : ""}
								/>
								<button
									type="button"
									className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-gray-50 transition"
									onClick={() => setShowSecret(!showSecret)}
								>
									{showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
							{errors.clientSecret && (
								<p className="text-red-500 text-sm mt-1">{errors.clientSecret}</p>
							)}
						</div>

						<div>
							<label htmlFor="callbackURL" className="block text-sm font-medium text-zinc-700 mb-1">
								Callback URL (for OAuth)
							</label>
							<div className="relative">
								<Input
									disabled
									id="label"
									value={callbackUrl}
									readOnly
									className="bg-gray-100 !cursor-default pr-16"
								/>
								<button
									type="button"
									className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-gray-50 transition"
									onClick={handleCopy}
								>
									<Copy className="w-4 h-4 inline-block mr-1" />
									<span className="text-sm">{copyText}</span>
								</button>
							</div>
						</div>

						<div className="flex justify-end mt-4 gap-3">
							<Button variant="outline" onClick={handleCancel} disabled={!isModified || isSaving}>
								Cancel
							</Button>
							<Button variant="default" onClick={handleSave} disabled={!isModified || isSaving}>
								Save
							</Button>
						</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
