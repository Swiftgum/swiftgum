import { adminRoute } from "@/utils/auth/admin";
import React from "react";
import { NavbarClient } from "./navbar-client";

export default async function Navbar() {
	await adminRoute();

	return <NavbarClient />;
}
