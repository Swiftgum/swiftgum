"use client";

import { cn } from "@/lib/utils";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
	CloudUpload,
	KeyRound,
	LoaderPinwheel,
	LogOut,
	Logs,
	Puzzle,
	Settings,
	Sparkles,
	User as UserIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { NavbarItem } from "./navbar-item";

interface NavbarContentsProps {
	onItemClick?: () => void;
}

type NavLinkItem = {
	href: string;
	icon: React.ReactNode;
	label: string;
	isActive: boolean;
};

type NavDividerItem = {
	type: "divider";
	key: string;
};

type NavItem = NavLinkItem | NavDividerItem;

function NavDivider({ className }: { className?: string }) {
	return <div className={cn("border-b border-b-gray-100 my-1", className)} />;
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
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user || null);
		};
		fetchUser();
	}, []);

	const navItems: NavItem[] = [
		{
			href: "/admin/quickstart",
			icon: <Sparkles size={18} />,
			label: "Quickstart",
			isActive: pathname?.startsWith("/admin/quickstart"),
		},
		{
			type: "divider",
			key: "quickstart-divider",
		},
		{
			href: "/admin/api",
			icon: <KeyRound size={18} />,
			label: "API Access",
			isActive: pathname?.startsWith("/admin/api"),
		},
		{
			href: "/admin/integrations",
			icon: <Puzzle size={18} />,
			label: "Integrations",
			isActive: pathname?.startsWith("/admin/integrations"),
		},
		{
			href: "/admin/destination",
			icon: <CloudUpload size={18} />,
			label: "Destination",
			isActive: pathname?.startsWith("/admin/destination"),
		},
		{
			href: "/admin/logs",
			icon: <Logs size={18} />,
			label: "Logs",
			isActive: pathname?.startsWith("/admin/logs"),
		},
		{
			href: "/admin/settings",
			icon: <Settings size={18} />,
			label: "Settings",
			isActive: pathname?.startsWith("/admin/settings"),
		},
	];

	return (
		<div className="flex flex-col flex-grow items-stretch gap-1 p-1.5 justify-end">
			{/* Navigation Items */}
			<div className="flex flex-col items-stretch gap-1">
				{navItems.map((item) =>
					"type" in item ? (
						<NavDivider key={item.key} />
					) : (
						<NavbarItem
							key={item.href}
							as="link"
							href={item.href}
							icon={item.icon}
							label={item.label}
							isActive={item.isActive}
							onClick={onItemClick}
						/>
					),
				)}
			</div>

			{/* User Profile */}
			{user && (
				<>
					<NavDivider className="md:mt-auto" />
					<div className="flex items-center gap-2 px-2 py-2">
						<div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
							{user.user_metadata.picture ? (
								<img
									src={user.user_metadata.picture}
									alt="User"
									className="w-full h-full object-cover rounded-full"
								/>
							) : (
								<UserIcon size={16} className="text-gray-500" />
							)}
						</div>
						<span className="text-sm text-gray-700 truncate md:hidden md:group-hover/nav:block md:group-has-[:focus-visible]/nav:block">
							{user.email}
						</span>
					</div>
				</>
			)}

			{/* Sign Out Form - at bottom */}
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleRequest(e, SignOut, router);
				}}
				className="flex justify-stretch"
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
