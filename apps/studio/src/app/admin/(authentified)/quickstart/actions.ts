"use server";

import { createClient } from "@/utils/supabase/server";

type ProviderMetadata = {
	logo: string;
	[key: string]: unknown;
};

type Integration = {
	integration_id: string;
	provider: {
		name: string;
		metadata: ProviderMetadata;
	};
};

export async function getEnabledIntegrations(): Promise<Integration[]> {
	const supabase = await createClient();

	const { data: integrations, error } = await supabase
		.from("integrations")
		.select(`
			integration_id,
			provider:providers (
				name,
				metadata
			)
		`)
		.eq("enabled", true);

	if (error) {
		console.error("Failed to fetch integrations:", error);
		return [];
	}

	return (integrations || []) as Integration[];
}

export async function hasDestination(): Promise<boolean> {
	const supabase = await createClient();

	const { count, error } = await supabase
		.from("destinations")
		.select("*", { count: "exact", head: true });

	if (error) {
		console.error("Failed to check destinations:", error);
		return false;
	}

	return (count || 0) > 0;
}
