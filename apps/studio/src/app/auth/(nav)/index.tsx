"use client";

import SubNavbarWrapper from "@/components/ui/subnavbar";
import { Home, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
	{ name: "Users", href: "/auth/users" },
	{ name: "Policies", href: "/auth/policies" },
	{ name: "Providers", href: "/auth/providers" },
	{ name: "Rate Limits", href: "/auth/rate-limits" },
	{ name: "Email Templates", href: "/auth/email-templates" },
	{ name: "URL Configuration", href: "/auth/url-configuration" },
	{ name: "Hooks", href: "/auth/hooks" },
];

export default function SubNavbar() {
	const pathname = usePathname();

	return (
		<SubNavbarWrapper>
			<span className="p-3 text-xs uppercase text-gray-600 font-semibold">Configuration</span>
			{menuItems.map(({ name, href }) => {
				const isActive = pathname.startsWith(href);

				return (
					<Link key={name} href={href} className="block !mt-0">
						<div
							className={`py-1 px-3 flex items-center rounded-lg transition-all text-sm
								${isActive ? "bg-blue-100 font-bold text-black" : "text-gray-500"}
								hover:text-black`}
						>
							<span>{name}</span>
						</div>
					</Link>
				);
			})}
		</SubNavbarWrapper>
	);
}
