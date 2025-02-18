"use client";

import { signInWithOAuth } from "@/utils/auth-helpers/client";
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
		<>
			{oAuthProviders.map((provider) => (
				<form key={provider.name} onSubmit={(e) => handleSubmit(e)}>
					<input type="hidden" name="provider" value={provider.name} />
					<Button
						size="lg"
						type="submit"
						className="w-full"
						onClick={() => {}}
						disabled={isSubmitting}
					>
						<div className="flex justify-center">
							<div className="mr-4">{provider.icon}</div>
							<div>{provider.displayName}</div>
						</div>
					</Button>
				</form>
			))}
		</>
	);
}
