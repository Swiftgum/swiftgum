"use client";

import { signInWithOAuth } from "@/utils/auth-helpers/client";
import { createClient } from "@/utils/supabase/client";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Provider } from "@supabase/supabase-js";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "../ui/button";

type OAuthProviders = {
	name: Provider;
	displayName: string;
	icon: ReactNode;
};

export default function OauthSignIn() {
	const supabase = createClient();

	const oAuthProviders: OAuthProviders[] = [
		{
			name: "google",
			displayName: "Google",
			icon: <FontAwesomeIcon icon={faGoogle} />,
		},
		/* Add desired OAuth providers here */
	];
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		setIsSubmitting(true); // Disable the button while the request is being handled
		await signInWithOAuth(e);
		setIsSubmitting(false);
	};

	return (
		<div className="mt-8">
			{oAuthProviders.map((provider) => (
				<form key={provider.name} className="pb-2" onSubmit={(e) => handleSubmit(e)}>
					<input type="hidden" name="provider" value={provider.name} />
					<Button
						// variant="slim"
						type="submit"
						className="w-full"
						onClick={() => {}}
						// loading={isSubmitting}
					>
						<div className="flex justify-center">
							<div className="mr-4">{provider.icon}</div>
							<div>{provider.displayName}</div>
						</div>
					</Button>
				</form>
			))}
		</div>
	);
}
