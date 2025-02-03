import NotionIcon from "@/components/Icons/notionIcon";
import { createClient } from "@/utils/supabase/server";
import {
	faGoogle,
	faKey,
	faLinkedinIn,
	faMicrosoft,
	faSlack,
	faTwitch,
	faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { SiKakaotalk } from "react-icons/si";
import OAuthProvider from "./oauthprovider";

export default async function Providers() {
	const providers = [
		{
			name: "Microsoft",
			icon: <FontAwesomeIcon icon={faMicrosoft} className="w-5 h-5" />,
			callbackUrl: "https://example.com/auth/microsoft/callback",
		},
		{
			name: "Google",
			icon: <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />,
			callbackUrl: "https://example.com/auth/google/callback",
		},
		{
			name: "Notion",
			icon: <NotionIcon className="w-5 h-5" />,
			callbackUrl: "https://example.com/auth/notion/callback",
		},
	];

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	return (
		<div className="p-20">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Auth Providers</h1>
				<p className="text-gray-600">
					Authenticate your users through a suite of providers and login methods
				</p>
			</div>

			{providers.map((provider) => (
				<OAuthProvider key={provider.name} {...provider} />
			))}
		</div>
	);
}
