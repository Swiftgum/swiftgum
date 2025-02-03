"use client";

import { Button } from "@/components/ui/button";
import { handleRequest } from "@/utils/auth-helpers/client";
import { SignOut } from "@/utils/auth-helpers/server";
import { getRedirectMethod } from "@/utils/auth-helpers/settings";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestWorkflowLog() {
	const supabase = createClient();
	const router = getRedirectMethod() === "client" ? useRouter() : null;
	const pathname = usePathname(); // ✅ Move this outside the return statement
	const [user, setUser] = useState(null);

	useEffect(() => {
		const fetchUser = async () => {
			const { data } = await supabase.auth.getUser();
			setUser(data?.user);
		};
		fetchUser();
	}, [supabase]);

	console.log("TestWorkflowLog USER", user);
	return (
		<div className="mt-8">
			{user && (
				<div className="mb-4">
					<form
						className="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-blue-100 dark:hover:bg-gray-800 focus:ring-0 mx-2"
						onSubmit={(e) => handleRequest(e, SignOut, router)}
					>
						<LogOut />
						<input type="hidden" name="pathName" value={pathname} />{" "}
						{/* ✅ No more hook order issue */}
						<Button>Sign out</Button>
					</form>
				</div>
			)}
		</div>
	);
}
