import Navbar from "@/components/admin/navbar";
import { adminRoute } from "@/utils/auth/admin";
import { Toaster } from "react-hot-toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	await adminRoute();

	return (
		<>
			<Toaster position="top-right" />
			<div className="flex h-screen">
				<Navbar />
				<div className="flex-1">{children}</div>
			</div>
		</>
	);
}
