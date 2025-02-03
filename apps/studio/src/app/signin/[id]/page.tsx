"use client";

import { Card } from "@/components/ui/card";

import { createClient } from "@/utils/supabase/client";
import { redirect } from "next/navigation";

import OauthSignIn from "@/components/AuthForms/OauthSignIn";

export default async function SignIn({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams: { disable_button: boolean };
}) {
	// Check if the user is already logged in and redirect to the account page if so
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	console.log("SignIn USER", user);
	if (user) {
		return redirect("/");
	}

	return (
		<div className="flex justify-center height-screen-helper">
			<div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
				<Card>
					<OauthSignIn />
				</Card>
			</div>
		</div>
	);
}
