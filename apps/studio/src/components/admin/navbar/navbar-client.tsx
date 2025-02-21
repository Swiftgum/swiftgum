"use client";

import clsx from "clsx";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import { NavbarContents } from "./navbar-contents";

export function NavbarClient() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Spacer to match the navbar width */}
			<div className="w-14 h-14 mr-px shrink-0 grow-0" />

			{/* Navbar - top on mobile, side on desktop */}
			<div className="group/nav flex md:flex-col fixed inset-x-0 md:inset-x-auto md:left-0 top-0 md:h-screen transition-all duration-300 z-50">
				{/* Mobile header */}
				<div className="flex-grow md:hidden flex items-stretch h-14 bg-white border-b">
					{/* Logo aligned left on mobile */}
					<div className="flex items-center">
						<NavbarContents.Logo />
					</div>
					{/* Menu button aligned right */}
					<button
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="aspect-square flex items-center justify-center ml-auto p-2 text-gray-700 hover:text-gray-900"
						aria-label="Toggle menu"
					>
						{isOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>

				{/* Desktop sidebar / Mobile dropdown */}
				<nav
					className={clsx(
						"md:flex md:flex-col flex-grow bg-white overflow-hidden transition-all duration-300",
						"md:border-r md:w-14 md:group-hover/nav:w-56 md:group-focus-within/nav:has-[:focus-visible]:w-56 md:group-hover/nav:shadow-lg box-content",
						// Mobile styles - items pushed to bottom with justify-end
						isOpen
							? "fixed md:relative inset-x-0 top-14 md:top-0 bottom-0 border-b flex flex-col"
							: "hidden",
					)}
				>
					{/* Desktop logo */}
					<div className="hidden md:block">
						<NavbarContents.Logo />
					</div>
					{/* Navigation items */}
					<NavbarContents onItemClick={() => setIsOpen(false)} />
				</nav>
			</div>

			{/* Mobile bottom spacer */}
			<div className="h-14 md:hidden" />
		</>
	);
}
