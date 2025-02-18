import { createClient } from "@/utils/supabase/server";
import Navlinks from "./Navlinks";

export default async function Navbar() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	return (
		<>
			<div className="w-16 flex-0" />
			<Navlinks />
		</>
	);
}
