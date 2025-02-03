"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronRight, Copy, Eye } from "lucide-react";
import { useState } from "react";

interface OAuthProviderProps {
	name: string;
	logo: string;
	callbackUrl: string;
}

export default function OAuthProvider({ name, logo, callbackUrl }: OAuthProviderProps) {
	const [enabled, setEnabled] = useState(false);
	const [clientId, setClientId] = useState("");
	const [clientSecret, setClientSecret] = useState("");
	const [showSecret, setShowSecret] = useState(false);
	const [expanded, setExpanded] = useState(false);

	const handleSave = () => {
		console.log("Saving:", { name, enabled, clientId, clientSecret });
	};

	return (
		<Card className="bg-white text-gray-900 border border-gray-200 w-full">
			<CardHeader
				className="flex justify-between items-center p-4 border-b cursor-pointer"
				onClick={() => setExpanded(!expanded)}
			>
				<div className="flex items-center gap-3">
					<img src={logo} alt={`${name} logo`} className="w-6 h-6" />
					<CardTitle>{name}</CardTitle>
				</div>
				<div className="flex items-center gap-3">
					<Button variant="outline" size="sm" disabled={!enabled}>
						{enabled ? "Enabled" : "Disabled"}
					</Button>
					{expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
				</div>
			</CardHeader>

			{expanded && (
				<CardContent className="space-y-4 p-4">
					<div className="flex items-center gap-3">
						<Switch checked={enabled} onCheckedChange={setEnabled} />
						<span>{name} enabled</span>
					</div>

					<div>
						<label htmlFor="clientId" className="block text-sm font-medium mb-1">
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
						<label htmlFor="clientSecret" className="block text-sm font-medium mb-1">
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
								className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
								onClick={() => setShowSecret(!showSecret)}
							>
								<Eye className="w-5 h-5" />
							</button>
						</div>
					</div>

					<div>
						<label htmlFor="callbackURL" className="block text-sm font-medium mb-1">
							Callback URL (for OAuth)
						</label>
						<div className="relative">
							<Input id="callbackURL" value={callbackUrl} readOnly />
							<button
								type="button"
								className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
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
	);
}
