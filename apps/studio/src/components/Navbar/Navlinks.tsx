"use client";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import { Database, House, KeyRound, LoaderPinwheel, LogOut, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "./NavItem";

export default function Navlinks() {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const pathname = usePathname();

	return (
		<div className="group/nav fixed left-0 top-0 flex h-screen transition-all duration-300">
			<nav className="flex flex-col flex-grow border-r shadow-lg  bg-white min-w-16 overflow-hidden transition-all duration-300 w-16 group-hover/nav:w-64 group-focus-within/nav:has-[:focus-visible]:w-64">
				<div className="flex items-center justify-center h-16 w-16">
					<LoaderPinwheel color="#0094FF" />
				</div>
				<div className="flex flex-grow flex-col items-stretch gap-1 p-2">
					<NavItem
						as="link"
						href="/admin"
						icon={<House size={18} />}
						label="Home"
						isActive={pathname === "/"}
					/>
					<NavItem
						as="link"
						href="/admin/auth/providers"
						icon={<KeyRound size={18} />}
						label="Authentication"
						isActive={pathname.startsWith("/auth/providers")}
					/>
					<NavItem
						as="link"
						href="/admin/destination/webhook"
						icon={<Database size={18} />}
						label="Destination"
						isActive={pathname.startsWith("/destination/webhook")}
					/>
					<NavItem
						as="link"
						href="/admin/settings/general"
						icon={<Settings size={18} />}
						label="Settings"
						isActive={pathname.startsWith("/settings/general")}
					/>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleRequest(e, SignOut, router);
						}}
						className="w-full flex flex-col items-stretch mt-auto"
					>
						<NavItem as="button" type="submit" icon={<LogOut size={18} />} label="Sign Out" />
					</form>
				</div>
			</nav>
		</div>
	);
}
