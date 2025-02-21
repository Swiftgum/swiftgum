import { PageHeader, PageShell } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as RevealInput from "@/components/ui/reveal-input";
import { getApiKey } from "./actions";
import { RotateKeyButton } from "./rotate-key-button";

export default async function ApiPage() {
	const apiKey = await getApiKey();

	return (
		<PageShell>
			<PageHeader title="API" description="View and manage your API credentials" />

			<div className="space-y-6">
				<Card>
					<CardContent className="space-y-4 pt-6">
						<div>
							<h2 className="text-lg font-medium text-zinc-700 mb-2">API Key</h2>
							<p className="text-sm text-gray-500 mb-4">
								Use this API key to authenticate your requests to the KnowledgeX API. Keep it secure
								and do not share it publicly.
							</p>
							<RevealInput.Root>
								<RevealInput.Input asChild>
									<Input type="password" value={apiKey} readOnly className="font-mono text-sm" />
								</RevealInput.Input>
								<RevealInput.Reveal asChild>
									<Button type="button" variant="default" />
								</RevealInput.Reveal>
							</RevealInput.Root>
						</div>
					</CardContent>
				</Card>

				<Card className="border-destructive">
					<CardContent className="pt-6">
						<div>
							<h2 className="text-lg font-medium text-destructive mb-2">Danger Zone</h2>
							<div className="flex items-center justify-between py-4 gap-4">
								<div>
									<h3 className="font-medium text-zinc-700">Rotate API Key</h3>
									<p className="text-sm text-gray-500">
										Generate a new API key and invalidate the current one. Make sure to update your
										applications to use the new key.
									</p>
								</div>
								<RotateKeyButton />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
