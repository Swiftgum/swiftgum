"use client";

import SubNavbarWrapper from "@/components/ui/subnavbar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const subNavbarSections = [
	{
		sectionName: "Configutation",
		items: [
			{ name: "Providers", href: "/auth/providers" },
			// { name: "New", href: "/settings/new" },
		],
	},
];

export default function SubNavbar() {
	const pathname = usePathname();

	return (
		<SubNavbarWrapper>
			{subNavbarSections.map(({ sectionName, items }) => {
				return (
					<div key={sectionName}>
						<div className="px-3 mb-2 text-xs uppercase text-gray-600 font-semibold">
							{sectionName}
						</div>
						{items.map(({ name, href }) => {
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
					</div>
				);
			})}
		</SubNavbarWrapper>
	);
}
