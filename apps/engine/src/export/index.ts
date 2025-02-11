import type { Destination } from "@knowledgex/interfaces";
import { z } from "zod";
import type { Database } from "../../../studio/src/utils/supabase/types";
import { sql } from "../db";

const exportMetadata = z.object({
	tokenId: z.string(),
	fileId: z.string(),
	remoteUrl: z.string(),
	fileName: z.string(),
	provider: z.string(),
	mimeType: z.string(),
});

export type ExportMetadata = z.infer<typeof exportMetadata>;

export const exportFile = async (content: string, metadata: ExportMetadata) => {
	await sql`
    SELECT * FROM pgmq.send_batch(
					queue_name => 'export_queue',
					msgs => ARRAY[
						${sql.array([
							JSON.stringify({
								content,
								metadata,
							}),
						])}::jsonb[]
					]
				)
		`;
};

export const getDestinations = async ({
	tokenId,
}: {
	tokenId: string;
}) => {
	const destinations = await sql`
		SELECT destinations.* FROM destinations_with_decrypted_params as destinations JOIN tokens ON tokens.workspace_id = destinations.workspace_id
		WHERE tokens.token_id = ${tokenId}
	`;

	return destinations as unknown as (Omit<
		Database["public"]["Views"]["destinations_with_decrypted_params"]["Row"],
		"decrypted_destination_params"
	> & {
		decrypted_destination_params: Destination;
	})[];
};

export const processExport = async ({
	content,
	metadata,
}: {
	content: string;
	metadata: ExportMetadata;
}) => {
	const destinations = await getDestinations({ tokenId: metadata.tokenId });

	for (const destination of destinations) {
		switch (destination.decrypted_destination_params.type) {
			case "webhook":
				await fetch(destination.decrypted_destination_params.webhook.url, {
					method: "POST",
					body: content,
				});

				break;
		}
	}
};
