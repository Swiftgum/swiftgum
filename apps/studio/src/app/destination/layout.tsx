// import SubNavbar from "@/components/SubNavbar";
import { Home, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import React, { type ReactNode } from "react";
import SubNavbar from "./(nav)";
const menuItems = [
	{ name: "Users", icon: Users, href: "/auth/users" },
	{ name: "Policies", icon: ShieldCheck, href: "/auth/policies" },
	{ name: "Providers", icon: Home, href: "/auth/providers" },
	{ name: "Rate Limits", icon: Settings, href: "/auth/rate-limits" },
	{ name: "Email Templates", icon: Settings, href: "/auth/email-templates" },
	{ name: "URL Configuration", icon: Settings, href: "/auth/url-configuration" },
	{ name: "Hooks", icon: Settings, href: "/auth/hooks", badge: "BETA" },
];

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<main className="flex h-screen overflow-hidden">
				<SubNavbar />
				<div className="flex-1 overflow-y-auto">{children}</div>
			</main>
		</>
	);
}
