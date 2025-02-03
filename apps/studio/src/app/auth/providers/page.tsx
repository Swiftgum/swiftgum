import { createClient } from "@/utils/supabase/server";
import OAuthProvider from "./oauthprovider";

export default async function Providers() {
	const providers = [
		{
			name: "Kakao",
			logo: "/logos/kakao.png",
			callbackUrl: "https://example.com/auth/kakao/callback",
		},
		{
			name: "KeyCloak",
			logo: "/logos/keycloak.png",
			callbackUrl: "https://example.com/auth/keycloak/callback",
		},
		{
			name: "LinkedIn (OIDC)",
			logo: "/logos/linkedin.png",
			callbackUrl: "https://example.com/auth/linkedin/callback",
		},
		{
			name: "Notion",
			logo: "/logos/notion.png",
			callbackUrl: "https://example.com/auth/notion/callback",
		},
		{
			name: "Twitch",
			logo: "/logos/twitch.png",
			callbackUrl: "https://example.com/auth/twitch/callback",
		},
		{
			name: "Twitter",
			logo: "/logos/twitter.png",
			callbackUrl: "https://example.com/auth/twitter/callback",
		},
		{
			name: "Slack (OIDC)",
			logo: "/logos/slack.png",
			callbackUrl: "https://example.com/auth/slack/callback",
		},
	];

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	return (
		<div>
			{providers.map((provider) => (
				<OAuthProvider key={provider.name} {...provider} />
			))}
		</div>
	);
}
