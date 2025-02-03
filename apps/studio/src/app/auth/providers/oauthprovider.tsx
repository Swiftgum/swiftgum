"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight, Copy, Eye } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";

interface OAuthProviderProps {
	name: string;
	icon: ReactNode;
	callbackUrl: string;
}

export default function OAuthProvider({ name, icon, callbackUrl }: OAuthProviderProps) {
	const [enabled, setEnabled] = useState(false);
	const [clientId, setClientId] = useState("");
	const [clientSecret, setClientSecret] = useState("");
	const [showSecret, setShowSecret] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const handleSave = () => {
		console.log("Saving:", { name, enabled, clientId, clientSecret });
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
							className={`${enabled ? "text-green-600 border-green-600" : "text-zinc-500"}`}
							disabled
						>
							{enabled ? "Enabled" : "Disabled"}
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
							/>
						</div>

						<div>
							<label
								htmlFor="clientSecret"
								className="block text-sm font-medium text-zinc-700 mb-1"
							>
								OAuth Client Secret
							</label>
							<div className="relative">
								<Input
									id="clientSecret"
									type={showSecret ? "text" : "password"}
									value={clientSecret}
									onChange={(e) => setClientSecret(e.target.value)}
									placeholder="Enter OAuth Client Secret"
									disabled={!enabled}
								/>
								<button
									type="button"
									className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-700"
									onClick={() => setShowSecret(!showSecret)}
								>
									<Eye className="w-5 h-5" />
								</button>
							</div>
						</div>

						<div>
							<label htmlFor="callbackURL" className="block text-sm font-medium text-zinc-700 mb-1">
								Callback URL (for OAuth)
							</label>
							<div className="relative">
								<Input id="callbackURL" value={callbackUrl} readOnly className="bg-gray-100" />
								<button
									type="button"
									className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-700"
									onClick={() => navigator.clipboard.writeText(callbackUrl)}
								>
									<Copy className="w-5 h-5" />
								</button>
							</div>
						</div>

						<div className="flex justify-between mt-4">
							<Button variant="outline">Cancel</Button>
							<Button variant="default" onClick={handleSave} disabled={!enabled}>
								Save
							</Button>
						</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}
