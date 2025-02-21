"use server";

import crypto from "node:crypto";
import { log } from "@/utils/log";
import { createServerOnlyClient } from "@/utils/supabase/server";
import { getWorkspace } from "@/utils/workspace";
import type { DecryptedDestination } from "@knowledgex/shared/types/overload";

export async function listDestinations() {
	const workspace = await getWorkspace();
	const supabaseServer = await createServerOnlyClient();

	const { data: destinations, error } = await supabaseServer
		.schema("private")
		.from("destinations_with_decrypted_params")
		.select("*")
		.eq("workspace_id", workspace.workspace_id);

	if (error) {
		throw new Error(`Failed to fetch destinations: ${error.message}`);
	}

	return destinations as unknown as DecryptedDestination[];
}

export async function updateDestination({
	destinationId,
	dataToEncrypt,
}: {
	destinationId: string;
	dataToEncrypt: {
		type: string;
		webhook: {
			url: string;
		};
	};
}) {
	const workspace = await getWorkspace();
	const supabase = await createServerOnlyClient();

	// First, check if there's an existing destination for this workspace
	const { data: existingDestinations, error: fetchError } = await supabase
		.from("destinations")
		.select("destination_id")
		.eq("workspace_id", workspace.workspace_id)
		.limit(1);

	if (fetchError) {
		throw new Error(`Failed to check existing destinations: ${fetchError.message}`);
	}

	// Use provided destinationId or existing one if found
	const targetDestinationId = destinationId || existingDestinations?.[0]?.destination_id;

	// Create hash of destination params for logging
	const paramsHash = crypto
		.createHash("sha256")
		.update(JSON.stringify(dataToEncrypt))
		.digest("hex");

	// Encrypt data using Supabase RPC function
	const { data: encryptedCredentials, error: encryptionError } = await supabase.rpc(
		"encrypt_destination_params",
		{
			p_workspace_id: workspace.workspace_id,
			p_params: dataToEncrypt,
		},
	);

	if (encryptionError) {
		throw new Error(`Failed to encrypt credentials: ${encryptionError.message}`);
	}

	if (targetDestinationId) {
		// Update existing destination
		const { data, error } = await supabase
			.from("destinations")
			.update({
				encrypted_destination_params: encryptedCredentials,
				updated_at: new Date().toISOString(),
			})
			.eq("destination_id", targetDestinationId)
			.select();

		if (error) {
			throw new Error(`Failed to save credentials: ${error.message}`);
		}

		// Check if update was successful (RLS might block it)
		if (!data || data.length === 0) {
			throw new Error("You do not have permission to update this destination");
		}

		void log({
			level: "security",
			type: "destination",
			name: "configuration:changed",
			workspace_id: workspace.workspace_id,
			id: {
				destination: targetDestinationId,
			},
			metadata: {
				action: "update",
				params_hash: paramsHash,
			},
			private: false,
		});

		return data[0];
	}

	// Insert new destination only if no existing destination was found
	const { data, error } = await supabase
		.from("destinations")
		.insert({
			workspace_id: workspace.workspace_id,
			encrypted_destination_params: encryptedCredentials,
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.select();

	if (error) {
		throw new Error(`Failed to save credentials: ${error.message}`);
	}

	// Check if insert was successful (RLS might block it)
	if (!data || data.length === 0) {
		throw new Error("You do not have permission to add a destination");
	}

	void log({
		level: "security",
		type: "destination",
		name: "configuration:changed",
		workspace_id: workspace.workspace_id,
		id: {
			destination: data[0].destination_id,
		},
		metadata: {
			action: "create",
			params_hash: paramsHash,
		},
		private: false,
	});

	return data[0];
}
