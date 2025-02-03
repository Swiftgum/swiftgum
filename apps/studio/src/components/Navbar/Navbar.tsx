import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import s from "./Navbar.module.css";
import Navlinks from "./Navlinks";

export default async function Navbar() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	return <Navlinks user={user} />;
}
