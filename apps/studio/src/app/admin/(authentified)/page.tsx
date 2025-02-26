import { adminRoute } from "@/utils/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Dashboard - Swiftgum Studio",
};

export default async function Home() {
	await adminRoute();

	redirect("/admin/quickstart");
}
