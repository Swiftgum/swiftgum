"use client";

import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import {
	CloudUpload,
	Database,
	House,
	KeyRound,
	LoaderPinwheel,
	LogOut,
	Logs,
	Puzzle,
	Settings,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { NavbarItem } from "./navbar-item";

interface NavbarContentsProps {
	onItemClick?: () => void;
}

// Logo component for reuse
function Logo() {
	return (
		<div className="flex items-center justify-center h-14 w-14">
			<LoaderPinwheel color="#0094FF" />
		</div>
	);
}

export function NavbarContents({ onItemClick }: NavbarContentsProps) {
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const pathname = usePathname();

	const navItems = [
		{
			href: "/admin",
			icon: <House size={18} />,
			label: "Home",
			isActive: pathname === "/admin",
		},
		{
			href: "/admin/api",
			icon: <KeyRound size={18} />,
			label: "API Access",
			isActive: pathname.startsWith("/admin/api"),
		},
		{
			href: "/admin/integrations",
			icon: <Puzzle size={18} />,
			label: "Integrations",
			isActive: pathname.startsWith("/admin/integrations"),
		},
		{
			href: "/admin/destination",
			icon: <CloudUpload size={18} />,
			label: "Destination",
			isActive: pathname.startsWith("/admin/destination"),
		},
		{
			href: "/admin/logs",
			icon: <Logs size={18} />,
			label: "Logs",
			isActive: pathname.startsWith("/admin/logs"),
		},
		{
			href: "/admin/settings",
			icon: <Settings size={18} />,
			label: "Settings",
			isActive: pathname.startsWith("/admin/settings"),
		},
	];

	return (
		<div className="flex flex-col flex-grow items-stretch gap-1 p-1.5 justify-end md:justify-between">
			{/* Navigation Items */}
			<div className="flex flex-col items-stretch gap-1">
				{navItems.map((item) => (
					<NavbarItem
						key={item.href}
						as="link"
						href={item.href}
						icon={item.icon}
						label={item.label}
						isActive={item.isActive}
						onClick={onItemClick}
					/>
				))}
			</div>

			{/* Sign Out Form - at bottom */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleRequest(e, SignOut, router);
				}}
				className="w-full flex flex-col items-stretch"
			>
				<NavbarItem
					as="button"
					type="submit"
					icon={<LogOut size={18} />}
					label="Sign Out"
					onClick={onItemClick}
				/>
			</form>
		</div>
	);
}

// Attach Logo component for use in other components
NavbarContents.Logo = Logo;
