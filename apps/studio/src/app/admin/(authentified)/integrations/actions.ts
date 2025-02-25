"use server";

import crypto from "node:crypto";
import { log } from "@/utils/log";
import { createClient, createServerOnlyClient } from "@/utils/supabase/server";
import { type AuthIntegrationCredential, getAuthProvider } from "@knowledgex/shared/providers/auth";
import type {
	DecryptedIntegration,
	Integration,
	Provider,
} from "@knowledgex/shared/types/overload";
import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
export type IntegrationWithProvider = {
	provider: Provider;
	integration: DecryptedIntegration | null;
	authProviderSchemaShape: z.AnyZodObject["shape"];
};

export type SaveIntegrationParams = {
	providerId: string;
	providerIdentifier: string;
	enabled: boolean;
	credentials: AuthIntegrationCredential;
};

async function getWorkspace() {
	const supabase = await createClient();

	const { data: workspace, error: workspaceError } = await supabase
		.from("workspace")
		.select("workspace_id")
		.single();

	if (!workspace || workspaceError) {
		throw new Error("No workspace found");
	}

	return workspace;
}

export async function saveIntegration(params: SaveIntegrationParams): Promise<Integration> {
	const supabase = await createServerOnlyClient();
	const workspace = await getWorkspace();

	const authProvider = getAuthProvider(params.providerIdentifier);

	const safeIntegrationCredentials = authProvider.configurationSchema.parse({
		providerId: params.providerIdentifier,
		data: params.credentials,
	});

	// Check if integration exists
	const { data: existingIntegration } = await supabase
		.from("integrations")
		.select("integration_id")
		.eq("workspace_id", workspace.workspace_id)
		.eq("provider_id", params.providerId)
		.single();

	// If credentials are provided, encrypt them and create a hash
	let encryptedCredentials = null;
	let credentialsHash = null;
	if (params.credentials) {
		// Create hash of credentials
		credentialsHash = crypto
			.createHash("sha256")
			.update(JSON.stringify(safeIntegrationCredentials))
			.digest("hex");

		const { data: encrypted, error: encryptionError } = await supabase.rpc(
			"encrypt_integration_credentials",
			{
				p_workspace_id: workspace.workspace_id,
				p_credentials: safeIntegrationCredentials,
			},
		);

		if (encryptionError) {
			console.error("Failed to encrypt credentials:", encryptionError);
			throw new Error("Failed to encrypt credentials");
		}

		encryptedCredentials = encrypted;
	}

	console.log("will do something about it");

	const now = new Date().toISOString();

	if (existingIntegration) {
		// Update existing integration
		const updateData = {
			enabled: params.enabled,
			updated_at: now,
			...(encryptedCredentials && { encrypted_credentials: encryptedCredentials }),
		};

		const { data: updated, error: updateError } = await supabase
			.from("integrations")
			.update(updateData)
			.eq("integration_id", existingIntegration.integration_id)
			.select()
			.single();

		if (updateError) {
			console.error("Failed to update integration:", updateError);
			throw new Error("Failed to update integration");
		}

		void log({
			level: "security",
			type: "integration",
			name: "configuration:changed",
			workspace_id: workspace.workspace_id,
			id: {
				provider: params.providerId,
				integration: existingIntegration.integration_id,
			},
			metadata: {
				enabled: params.enabled,
				action: "update",
				credentials_hash: credentialsHash,
			},
			private: false,
		});

		return updated;
	}

	// Create new integration
	if (!params.credentials) {
		throw new Error("Credentials are required for new integrations");
	}

	const { data: created, error: createError } = await supabase
		.from("integrations")
		.insert({
			workspace_id: workspace.workspace_id,
			provider_id: params.providerId,
			enabled: params.enabled,
			encrypted_credentials: encryptedCredentials,
			created_at: now,
			updated_at: now,
		})
		.select()
		.single();

	if (createError) {
		console.error("Failed to create integration:", createError);
		throw new Error("Failed to create integration");
	}

	void log({
		level: "security",
		type: "integration",
		name: "configuration:changed",
		workspace_id: workspace.workspace_id,
		id: {
			provider: params.providerId,
			integration: created.integration_id,
		},
		metadata: {
			enabled: params.enabled,
			action: "create",
			credentials_hash: credentialsHash,
		},
		private: false,
	});

	return created;
}

export async function listIntegrations(): Promise<IntegrationWithProvider[]> {
	const supabase = await createServerOnlyClient();
	const workspace = await getWorkspace();

	// Fetch both providers and integrations in parallel for better performance
	const [providersResult, integrationsResult] = await Promise.all([
		supabase.from("providers").select("*").returns<Provider[]>(),
		supabase
			.schema("private")
			.from("integrations_with_decrypted_credentials")
			.select("*")
			.eq("workspace_id", workspace.workspace_id)
			.returns<DecryptedIntegration[]>(),
	]);

	if (providersResult.error || integrationsResult.error) {
		console.error("Error fetching data:", {
			providersError: providersResult.error,
			integrationsError: integrationsResult.error,
		});
		throw new Error("Failed to fetch integrations data");
	}

	const providers = providersResult.data;
	const integrations = integrationsResult.data;

	// Map providers with their integration status
	return providers.map((provider) => {
		const integration = integrations.find((i) => i.provider_id === provider.provider_id);

		return {
			provider,
			integration: integration || null,
			authProviderSchemaShape: zodToJsonSchema(
				getAuthProvider(provider.identifier).configurationSchema,
			),
		};
	});
}
