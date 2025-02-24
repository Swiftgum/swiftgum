import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
	title: "Swiftgum Studio",
};

export default function Home() {
	redirect("/admin");
}
