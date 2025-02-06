"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronDown, ChevronRight, Copy, Eye, EyeOff } from "lucide-react";
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
	callbackUrl: string;
	integration?: {
		integration_id: string | null;
		enabled: boolean | null;
		decrypted_credentials: DecryptedCredentials | null;
		created_at: string | null;
		updated_at: string | null;
		workspace_id: string | null;
		provider_id: string | null;
	} | null;
	workspaceId: string;
	providerId: string;
}

export default function OAuthProvider({ name, icon }: OAuthProviderProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const connected = true;
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setIsSubmitting(true); // Disable the button while the request is being handled
		//
		// await signInWithOAuth(e);
		setIsSubmitting(false);
	};

	return (
		<div className="flex items-center">
			<div className="w-1/2">
				<form key={name} className="" onSubmit={(e) => handleSubmit(e)}>
					<input type="hidden" name="provider" value={name} />
					<Button
						// variant="slim"
						type="submit"
						className="w-full"
						onClick={() => {}}
						// loading={isSubmitting}
					>
						<div className="flex justify-center">
							<div className="mr-4">{icon}</div>
							<div>{name}</div>
						</div>
					</Button>
				</form>
			</div>
			<div className="flex gap-3 !mt-0">
				<Button
					variant="outline"
					size="sm"
					className={connected ? "text-green-600 border-green-600 bg-green-100" : "text-zinc-500"}
					disabled
				>
					{connected ? (
						<>
							<Check color="#16a34a" /> Connected
						</>
					) : (
						"Disabled"
					)}
				</Button>
			</div>
		</div>
	);
}
