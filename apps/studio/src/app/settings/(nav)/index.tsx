"use client";

import SubNavbarWrapper from "@/components/ui/subnavbar";
import { Home, Settings, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const projectSettingItems = [
	{ name: "General", href: "/settings/general" },
	{ name: "Integrations", href: "/settings/integrations" },
];

const billingItems = [
	{ name: "Subscription", href: "/billing/subscription" },
	{ name: "Usage", href: "/billing/usage" },
];

export default function SubNavbar() {
	const pathname = usePathname();

	return (
		<SubNavbarWrapper>
			<span className="p-3 text-xs uppercase text-gray-600 font-semibold">Project Settings</span>
			{projectSettingItems.map(({ name, href }) => {
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
			<span className="p-3 text-xs uppercase text-gray-600 font-semibold">Billing</span>
			{billingItems.map(({ name, href }) => {
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
