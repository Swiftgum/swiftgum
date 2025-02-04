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
import OAuthProvider from "./generalpanel";
import OAuthSettingsPanel from "./generalpanel";
import GeneralPanel from "./generalpanel";

export default async function Providers() {
	const supabase = await createClient();

	// Get authenticated user
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();
	if (userError || !user) {
		console.error("Error fetching user:", userError);
		return <p>Error fetching user</p>;
	}

	// Fetch workspace info
	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace") // Replace with your actual table name
		.select("workspace_id, label")
		.eq("owner_user_id", user.id) // Assuming you have a user_id field in the workspaces table
		.single();

	if (workspaceError) {
		console.error("Error fetching workspace:", workspaceError);
	}

	return (
		<div className="p-20">
			<div className="mb-10">
				<h1 className="text-2xl font-bold text-zinc-700">Auth Providers</h1>
				<p className="text-gray-600">
					Authenticate your users through a suite of providers and login methods
				</p>
			</div>

			{/* Pass workspace info to GeneralPanel */}
			<GeneralPanel workspaceId={workspace?.workspace_id ?? ""} label={workspace?.label ?? ""} />
		</div>
	);
}
