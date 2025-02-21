import type { ReactNode } from "react";

interface PageShellProps {
	children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
	return <div className="p-8 max-w-4xl mx-auto">{children}</div>;
}
