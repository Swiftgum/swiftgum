import { createClient } from "@/utils/supabase/server";
import React from "react";
import { NavbarClient } from "./navbar-client";

export default async function Navbar() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return null;

	return <NavbarClient />;
}
