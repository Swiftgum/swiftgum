import clsx from "clsx";
import Link from "next/link";
import type React from "react";
import type { ComponentProps } from "react";
import { focusStyles } from "../../ui/shared";

type BaseProps = {
	icon: React.ReactNode;
	label: string;
	isActive?: boolean;
};

type AsLink = BaseProps & {
	as: "link";
	href: string;
} & ComponentProps<typeof Link>;

type AsButton = BaseProps & {
	as: "button";
} & ComponentProps<"button">;

type NavbarItemProps = AsLink | AsButton;

export function NavbarItem({ icon, label, isActive, onClick, ...props }: NavbarItemProps) {
	const className = clsx(
		"group/nav-item h-11 flex items-center transition-all rounded relative",
		focusStyles,
		isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
		"focus:bg-gray-100 focus:text-blue-500",
		"md:opacity-100", // Always visible on desktop
	);

	const content = (
		<>
			<div className="flex items-center justify-center w-11 shrink-0">{icon}</div>
			<span className="truncate md:opacity-0 pr-4 md:group-hover/nav:opacity-100 transition-[opacity,transform] duration-300 md:-translate-x-2 md:group-hover/nav:-translate-x-0 md:group-has-[:focus-visible]/nav:opacity-100 md:group-has-[:focus-visible]/nav:-translate-x-0 font-medium text-sm">
				{label}
			</span>
		</>
	);

	if (props.as === "link") {
		const { as, ...linkProps } = props;
		return (
			<Link className={className} {...linkProps}>
				{content}
			</Link>
		);
	}

	const { as, ...buttonProps } = props;
	return (
		<button className={className} {...buttonProps}>
			{content}
		</button>
	);
}
