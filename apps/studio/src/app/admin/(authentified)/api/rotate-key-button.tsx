"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { rotateApiKey } from "./actions";

export function RotateKeyButton() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	return (
		<form
			action={async (formData: FormData) => {
				startTransition(async () => {
					await rotateApiKey(formData);
					router.refresh();
				});
			}}
		>
			<Button type="submit" variant="destructive" disabled={isPending}>
				{isPending ? "Rotating..." : "Rotate Key"}
			</Button>
		</form>
	);
}
