import type { ReactNode } from "react";

export default function SubNavbarWrapper({ children }: { children: ReactNode }) {
	return (
		<aside className="w-64 h-screen p-5 text-gray-900 h-screen border-r border-zinc-200">
			<div className="space-y-2">{children}</div>
		</aside>
	);
}
