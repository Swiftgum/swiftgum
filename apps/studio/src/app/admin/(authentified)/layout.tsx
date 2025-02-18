import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
