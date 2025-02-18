import clsx from "clsx";
import Link from "next/link";
import type { ComponentProps } from "react";
import { focusStyles } from "../ui/shared";

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

type NavItemProps = AsLink | AsButton;

export function NavItem({ icon, label, isActive, ...props }: NavItemProps) {
	const className = clsx(
		"group/nav-item h-12 flex items-center transition-all rounded relative",
		focusStyles,
		isActive ? "bg-gray-100 text-blue-500" : "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
		"focus:bg-gray-100 focus:text-blue-500",
	);

	const content = (
		<>
			<div className="flex items-center justify-center w-12 shrink-0">{icon}</div>
			<span className="whitespace-nowrap opacity-0 pr-4 shrink-0 group-hover/nav:opacity-100 transition-[opacity,transform] duration-300 -translate-x-2 group-hover/nav:-translate-x-0 group-has-[:focus-visible]/nav:opacity-100 group-has-[:focus-visible]/nav:-translate-x-0 font-medium text-base">
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
