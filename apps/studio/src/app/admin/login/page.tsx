import OauthSignIn from "@/components/AuthForms/OauthSignIn";

export default function Login() {
	return (
		<div className="flex flex-col items-stretch md:items-center justify-center bg-gray-100 min-h-screen">
			<div className="w-full md:max-w-lg">
				<div className="bg-white outline outline-[0.5px] outline-black/10 shadow-lg p-8 md:rounded-2xl animate-in slide-in-from-bottom fade-in relative">
					<div className="flex flex-col gap-8 justify-center">
						<h1 className="text-4xl font-extrabold tracking-tighter text-balance">KnowledgeX</h1>
						<p className="text-gray-500 text-lg text-balance leading-tight">
							Log in to KnowledgeX to start connecting your user's private data to your app.
						</p>
						<OauthSignIn />
					</div>
				</div>
			</div>
		</div>
	);
}
