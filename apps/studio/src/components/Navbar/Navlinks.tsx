"use client";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import type { User } from "@supabase/supabase-js";
import { Database, House, KeyRound, LoaderPinwheel, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface NavlinksProps {
	user?: User;
}

export default function Navlinks({ user }: NavlinksProps) {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const [hovered, setHovered] = useState(false);
	const pathname = usePathname();

	return (
		<div className="fixed left-0 top-0 flex h-screen transition-all duration-300">
			<nav
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				className="flex flex-col border border-gray-200 shadow-lg dark:border-gray-800 dark:bg-gray-900 bg-white min-w-[64px] overflow-hidden transition-all duration-300"
			>
				<div className="group flex items-center px-3 py-2 transition-all mx-2 relative">
					<div className="flex items-center justify-center">
						<LoaderPinwheel color="#0094FF" />
					</div>
				</div>
				<div className="flex flex-col flex-grow justify-between">
					<div className="flex flex-col gap-3">
						<NavItem
							href="/"
							icon={<House size={16} />}
							label="Home"
							hovered={hovered}
							pathname={pathname}
						/>
						<NavItem
							href="/auth/providers"
							icon={<KeyRound size={16} />}
							label="Authentication"
							hovered={hovered}
							pathname={pathname}
						/>
						<NavItem
							href="/destination/webhook"
							icon={<Database size={16} />}
							label="Destination"
							hovered={hovered}
							pathname={pathname}
						/>
						<NavItem
							href="/settings/general"
							icon={<Settings size={16} />}
							label="Settings"
							hovered={hovered}
							pathname={pathname}
						/>
					</div>
					<div className="mb-4 mx-2">
						<form
							onSubmit={(e) => {
								e.preventDefault();
								console.log("SUBMIT");
								handleRequest(e, SignOut, router);
							}}
						>
							<button
								type="submit"
								className="
								w-full
								flex
								items-center
								px-3
								py-2
								transition-all
								rounded
								relative
								hover:text-black
								dark:hover:text-white
								hover:bg-blue-100
								dark:hover:bg-gray-800"
							>
								<LogOut size={16} />
								<span
									className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
										hovered ? "ml-3 w-auto opacity-100" : "w-0 opacity-0"
									}`}
								>
									Sign Out
								</span>
							</button>
						</form>
					</div>
				</div>
			</nav>
		</div>
	);
}

const NavItem = ({
	href,
	icon,
	label,
	hovered,
	pathname,
}: { href: string; icon: React.ReactNode; label: string; hovered: boolean; pathname: string }) => {
	const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

	return (
		<Link
			href={href}
			className={`group flex items-center px-3 py-2 transition-all rounded mx-2 relative ${
				isActive ? "bg-blue-200 dark:bg-gray-700" : "hover:bg-blue-100 dark:hover:bg-gray-800"
			}`}
		>
			<div className="flex items-center justify-center">{icon}</div>
			<span
				className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
					hovered ? "ml-3 w-auto opacity-100" : "w-0 opacity-0"
				}`}
			>
				{label}
			</span>
		</Link>
	);
};
