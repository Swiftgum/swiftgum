"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { updateWorkspaceSettings } from "./actions";

interface SettingsFormProps {
	label: string | null;
	workspaceId: string;
	appName?: string | null;
	appIcon?: string | null;
}

export function SettingsForm({ label, workspaceId, appName, appIcon }: SettingsFormProps) {
	const [projectName, setProjectName] = useState(label);
	const [appNameValue, setAppNameValue] = useState(appName || "");
	const [appIconPreview, setAppIconPreview] = useState(appIcon);
	const [originalProjectName] = useState(label);
	const [originalAppName] = useState(appName || "");
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
				label: projectName ?? "",
				appName: appNameValue,
				appIcon: appIconPreview,
			});

			toast.success("Successfully saved settings!");
		} catch (error) {
			console.error("Error updating workspace:", error);
			toast.error(error instanceof Error ? error.message : "Failed to save settings.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<label htmlFor="projectName" className="block text-sm font-medium text-zinc-700 mb-1">
					Project name
				</label>
				<Input
					id="projectName"
					value={projectName ?? ""}
					onChange={(e) => setProjectName(e.target.value)}
					placeholder="Project name"
				/>
			</div>

			<div>
				<label htmlFor="appName" className="block text-sm font-medium text-zinc-700 mb-1">
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
				<label htmlFor="appIcon" className="block text-sm font-medium text-zinc-700 mb-1">
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

			<div className="flex justify-end gap-3">
				<Button
					variant="default"
					onClick={handleSave}
					disabled={!isModified || isSaving}
					className={!isModified ? "opacity-50 !cursor-default" : ""}
				>
					{isSaving ? "Saving..." : "Save changes"}
				</Button>
			</div>
		</div>
	);
}
