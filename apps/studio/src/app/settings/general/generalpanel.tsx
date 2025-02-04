"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { type ReactNode, useState } from "react";

interface OAuthSettingsPanelProps {
	label: string;
	workspaceId: string;
}
export default function GeneralPAnel({ label, workspaceId }: OAuthSettingsPanelProps) {
	const [projectName, setProjectName] = useState(label);
	const [originalProjectName] = useState(projectName);

	const isModified = projectName !== originalProjectName;

	const handleSave = () => {
		console.log("Saving:", { name, projectName, workspaceId });
	};

	return (
		<div className="overflow-y-auto">
			<Card className="bg-white text-zinc-900 border border-gray-300 w-full shadow-md !rounded-none">
				<CardContent className="space-y-6 p-5 bg-gray-50 max-h-[calc(100vh-150px)] overflow-y-auto">
					<div className="flex">
						<div className="w-1/2 flex items-start gap-3">
							<div>
								<span className="text-sm text-zinc-700 font-bold">General Settings</span>
							</div>
						</div>

						<div className="flex flex-col w-1/2 gap-5">
							<div>
								<label htmlFor="clientId" className="block text-sm font-medium text-zinc-700 mb-px">
									Project name
								</label>
								<Input
									id="clientId"
									value={projectName}
									onChange={(e) => setProjectName(e.target.value)}
									placeholder="Project name"
								/>
							</div>

							<div>
								<label htmlFor="label" className="block text-sm font-medium text-zinc-700 mb-1">
									Project ID
								</label>
								<div className="relative cursor-pointer">
									<Input
										disabled
										id="label"
										value={label}
										readOnly
										className="bg-gray-100 !cursor-default"
									/>
									<button
										type="button"
										className="absolute right-3 top-2 text-zinc-500 hover:text-zinc-700"
										onClick={() => navigator.clipboard.writeText(label)}
									>
										<Copy className="w-5 h-5" />
									</button>
								</div>
							</div>
						</div>
					</div>
					<div className="flex justify-end mt-4 gap-3">
						<Button
							variant="outline"
							disabled={!isModified}
							className={!isModified ? "opacity-50 !cursor-default" : ""}
						>
							Cancel
						</Button>
						<Button
							variant="default"
							onClick={handleSave}
							disabled={!isModified}
							className={!isModified ? "opacity-50 !cursor-default" : ""}
						>
							Save
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
