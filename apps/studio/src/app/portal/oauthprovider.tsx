"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getURL } from "@/utils/helpers";
import { Check, ChevronDown, ChevronRight, Copy, Eye, EyeOff } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface DecryptedCredentials {
	type: "oauth2";
	oauth2: {
		client_secret: string;
		client_id: string;
	};
}

interface OAuthProviderProps {
	name: string;
	icon: React.ReactNode;
	integration?: {
		integration_id: string | null;
		enabled: boolean | null;
		decrypted_credentials: DecryptedCredentials | null;
		created_at: string | null;
		updated_at: string | null;
		workspace_id: string | null;
		provider_id: string | null;
	} | null;
	token: string;
	workspaceId: string;
	providerId: string;
	integrationId: string;
	portalSessionId: string;
}

export default function OAuthProvider({
	name,
	icon,
	integrationId,
	portalSessionId,
	token,
}: OAuthProviderProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const redirectURL = `/portal/auth/initiate?integration_id=${integrationId}&sid=${portalSessionId}`;
	const connected = true;

	return (
		<div className="flex items-center gap-2">
			<div className="w-1/2">
				<Button variant={token ? "secondary" : "default"} type="submit" className="w-full" asChild>
					<a href={redirectURL} className="flex justify-center">
						<div className="mr-4">{icon}</div>
						<div> {name}</div>
					</a>
				</Button>
			</div>
			<div className="flex gap-3 !mt-0">
				{token ? (
					<>
						<Button
							variant="outline"
							size="sm"
							className={
								connected ? "text-green-600 border-green-600 bg-green-100" : "text-zinc-500"
							}
							disabled
						>
							<Check color="#16a34a" /> Connected
						</Button>
					</>
				) : null}
			</div>
		</div>
	);
}
