"use client";

import type { Log } from "@knowledgex/shared/log";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export function useFilterParams() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const setFilters = useCallback(
		(levels: Log["level"][], resources: string[]) => {
			const params = new URLSearchParams(searchParams);

			// Update levels
			if (levels.length > 0) {
				params.set("levels", levels.join(","));
			} else {
				params.delete("levels");
			}

			// Update resources
			if (resources.length > 0) {
				params.set("resources", resources.join(","));
			} else {
				params.delete("resources");
			}

			router.replace(`${pathname}?${params.toString()}`);
		},
		[pathname, router, searchParams],
	);

	const getFilters = useCallback(() => {
		const levels = (searchParams.get("levels")?.split(",") as Log["level"][]) || [];
		const resources = searchParams.get("resources")?.split(",") || [];
		return { levels, resources };
	}, [searchParams]);

	return {
		setFilters,
		getFilters,
	};
}
