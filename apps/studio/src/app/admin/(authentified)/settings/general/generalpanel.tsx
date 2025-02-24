"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { updateWorkspaceSettings } from "./actions";

interface GeneralPanelProps {
	label: string;
	workspaceId: string;
	appName?: string;
	appIcon?: string;
}

export default function GeneralPanel({ label, workspaceId, appName, appIcon }: GeneralPanelProps) {
	const [projectName, setProjectName] = useState(label);
	const [appNameValue, setAppNameValue] = useState(appName || "");
	const [appIconPreview, setAppIconPreview] = useState(appIcon);
	const [originalProjectName, setOriginalProjectName] = useState(label);
	const [originalAppName, setOriginalAppName] = useState(appName || "");
	const [isSaving, setIsSaving] = useState(false);
	const [copyText, setCopyText] = useState("Copy");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const isModified =
		projectName !== originalProjectName ||
		appNameValue !== originalAppName ||
		(fileInputRef.current?.files?.length ?? 0) > 0;

	const handleCopy = () => {
		navigator.clipboard.writeText(workspaceId);
		setCopyText("Copied");
		setTimeout(() => setCopyText("Copy"), 2000);
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		if (file.size > 10 * 1024 * 1024) {
			toast.error("Image must be less than 10MB");
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setAppIconPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			await updateWorkspaceSettings({
				workspaceId,
				label: projectName,
				appName: appNameValue,
				appIcon: appIconPreview,
			});

			toast.success("Successfully saved settings!");
			setOriginalProjectName(projectName);
			setOriginalAppName(appNameValue);
			if (fileInputRef.current) fileInputRef.current.value = "";
		} catch (error) {
			console.error("Error updating workspace:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save settings.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		setProjectName(originalProjectName);
		setAppNameValue(originalAppName);
		setAppIconPreview(appIcon);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	return (
		<Card>
			<CardContent className="space-y-6 p-5">
				<div className="flex">
					<div className="w-1/2 flex items-start gap-3">
						<div>
							<span className="text-sm text-zinc-700 font-bold">General Settings</span>
						</div>
					</div>

					<div className="flex flex-col w-1/2 gap-5">
						<div>
							<label
								htmlFor="projectName"
								className="block text-sm font-medium text-zinc-700 mb-px"
							>
								Project name
							</label>
							<Input
								id="projectName"
								value={projectName}
								onChange={(e) => setProjectName(e.target.value)}
								placeholder="Project name"
							/>
						</div>

						<div>
							<label htmlFor="appName" className="block text-sm font-medium text-zinc-700 mb-px">
								App name
							</label>
							<Input
								id="appName"
								value={appNameValue}
								onChange={(e) => setAppNameValue(e.target.value)}
								placeholder="App name shown to users"
							/>
						</div>

						<div>
							<label htmlFor="appIcon" className="block text-sm font-medium text-zinc-700 mb-px">
								App icon
							</label>
							<div className="flex items-center gap-4">
								<div className="h-10 aspect-square border rounded flex items-center justify-center bg-gray-50 overflow-hidden">
									{appIconPreview ? (
										<img src={appIconPreview} alt="App icon" className="max-h-full w-auto" />
									) : (
										<ImageIcon className="w-6 h-6 text-gray-400" />
									)}
								</div>
								<Input
									id="appIcon"
									type="file"
									ref={fileInputRef}
									onChange={handleFileChange}
									accept="image/jpeg,image/png,image/svg+xml"
									className="flex-1"
								/>
							</div>
							<p className="mt-1 text-sm text-gray-500">JPEG, PNG or SVG (max. 10MB)</p>
						</div>

						<div>
							<label htmlFor="projectId" className="block text-sm font-medium text-zinc-700 mb-1">
								Project ID
							</label>
							<div className="relative">
								<Input
									disabled
									id="projectId"
									value={workspaceId}
									readOnly
									className="bg-gray-100 !cursor-default pr-16"
								/>
								<button
									type="button"
									className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-gray-50 transition"
									onClick={handleCopy}
								>
									<Copy className="w-4 h-4 inline-block mr-1" />
									<span className="text-sm">{copyText}</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-4 gap-3">
					<Button
						variant="outline"
						disabled={!isModified || isSaving}
						onClick={handleCancel}
						className={!isModified ? "opacity-50 !cursor-default" : ""}
					>
						Cancel
					</Button>
					<Button
						variant="default"
						onClick={handleSave}
						disabled={!isModified || isSaving}
						className={!isModified ? "opacity-50 !cursor-default" : ""}
					>
						{isSaving ? "Saving..." : "Save"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
