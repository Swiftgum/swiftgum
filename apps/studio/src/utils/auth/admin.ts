import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const adminRoute = async () => {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/admin/login");
	}

	return user;
};
