"use client";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import { Database, House, KeyRound, LoaderPinwheel, LogOut, Logs, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { NavItem } from "./NavItem";

export default function Navlinks() {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const pathname = usePathname();

	return (
		<div className="group/nav fixed left-0 top-0 flex h-screen transition-all duration-300 z-50">
			<nav className="flex flex-col flex-grow border-r bg-white overflow-hidden transition-all duration-300 w-14 group-hover/nav:w-56 group-focus-within/nav:has-[:focus-visible]:w-56 group-hover/nav:shadow-lg box-content relative">
				<div className="flex items-center justify-center h-14 w-14">
					<LoaderPinwheel color="#0094FF" />
				</div>
				<div className="flex flex-grow flex-col items-stretch gap-1 p-1.5">
					<NavItem
						as="link"
						href="/admin"
						icon={<House size={18} />}
						label="Home"
						isActive={pathname === "/admin"}
					/>
					<NavItem
						as="link"
						href="/admin/auth/providers"
						icon={<KeyRound size={18} />}
						label="Authentication"
						isActive={pathname.startsWith("/admin/auth/providers")}
					/>
					<NavItem
						as="link"
						href="/admin/destination/webhook"
						icon={<Database size={18} />}
						label="Destination"
						isActive={pathname.startsWith("/admin/destination/webhook")}
					/>
					<NavItem
						as="link"
						href="/admin/logs"
						icon={<Logs size={18} />}
						label="Logs"
						isActive={pathname.startsWith("/admin/logs")}
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
