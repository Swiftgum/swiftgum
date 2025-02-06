// import SubNavbar from "@/components/SubNavbar";
import React, { type ReactNode } from "react";
import SubNavbar from "./(nav)";
export default function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<main className="flex h-screen overflow-hidden">
				<SubNavbar />
				<div className="flex-1 overflow-y-auto">{children}</div>
			</main>
		</>
	);
}
