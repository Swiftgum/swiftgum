import type { Database } from "@/utils/supabase/types";
import clsx from "clsx";
import { Check } from "lucide-react";

export default function OAuthProvider({
	provider,
	portalSession,
	integration,
	token,
}: {
	provider: Database["public"]["Tables"]["providers"]["Row"];
	portalSession: Database["public"]["Tables"]["portal_sessions"]["Row"];
	integration: Database["public"]["Tables"]["integrations"]["Row"];
	token?: Database["public"]["Tables"]["tokens"]["Row"];
}) {
	const redirectURL = `/portal/auth/initiate?integration_id=${integration.integration_id}&sid=${portalSession.portal_session_id}`;

	return (
		<a
			href={redirectURL}
			className={clsx(
				"relative flex justify-center flex-col gap-4 items-center p-4 pb-3 border rounded-lg aspect-square transition-all overflow-hidden bg-clip-border shadow-sm focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				token ? "border-green-500" : "hover:bg-gray-100",
			)}
		>
			{token && (
				<span className="absolute top-0 right-0 rounded-bl-lg text-green-500 p-1.5">
					<Check className="w-4 h-4 " />
				</span>
			)}
			<div className="flex grow w-full justify-center items-center relative overflow-hidden px-2">
				<img
					className="max-h-full w-20"
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					src={(provider.metadata as any).logo as string}
					alt={provider.name}
				/>
			</div>
			<span className="font-medium text-sm text-center leading-snug">{provider.name}</span>
		</a>
	);
}
