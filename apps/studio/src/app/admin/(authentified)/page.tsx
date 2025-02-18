import { adminRoute } from "@/utils/auth/admin";

export default async function Home() {
	const user = await adminRoute();

	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<div>
					<p className="text-center text-2xl font-bold">
						User: <span className="font-mono">{user.email}</span>
					</p>
				</div>
			</main>
		</div>
	);
}
