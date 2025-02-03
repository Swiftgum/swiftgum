"use client";

import SubNavbarWrapper from "@/components/ui/subnavbar";
import { Home, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
	{ name: "Users", icon: Users, href: "/auth/users" },
	{ name: "Policies", icon: ShieldCheck, href: "/auth/policies" },
	{ name: "Providers", icon: Home, href: "/auth/providers" },
	{ name: "Rate Limits", icon: Settings, href: "/auth/rate-limits" },
	{ name: "Email Templates", icon: Settings, href: "/auth/email-templates" },
	{ name: "URL Configuration", icon: Settings, href: "/auth/url-configuration" },
	{ name: "Hooks", icon: Settings, href: "/auth/hooks", badge: "BETA" },
];

export default function SubNavbar() {
	const pathname = usePathname(); // Get current route

	return (
		<SubNavbarWrapper>
			{menuItems.map(({ name, icon: Icon, href, badge }) => (
				<Link key={name} href={href}>
					<div
						className={`flex items-center gap-3 p-3 rounded-lg transition ${
							pathname === href ? "bg-gray-100" : "hover:bg-gray-50"
						}`}
					>
						<Icon className="w-5 h-5 text-gray-600" />
						<span>{name}</span>
						{badge && (
							<span className="ml-auto bg-yellow-500 text-xs px-2 py-1 rounded">{badge}</span>
						)}
					</div>
				</Link>
			))}
		</SubNavbarWrapper>
	);
}
