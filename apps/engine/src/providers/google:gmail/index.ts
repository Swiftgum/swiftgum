import { auth, gmail_v1 } from "@googleapis/gmail";
import { providerSchemas } from "@knowledgex/shared/interfaces";
import type { z } from "zod";
import { makeSgid } from "../../export";
import { getToken } from "../../utils/token";
import { provider } from "../abstract";

const getGmail = ({ accessToken }: { accessToken: string }) => {
	const authClient = new auth.OAuth2();
	authClient.setCredentials({ access_token: accessToken });
	return new gmail_v1.Gmail({ auth: authClient });
};

export const googleGmailProvider = provider({
	schema: providerSchemas.googleGmailSchema,
	internal: async ({ task, exportFile }) => {
		const token = await getToken(task);
		const gmail = getGmail({
			accessToken: token.decrypted_tokenset.data.accessToken,
		});

		if (task.step === "pending") {
			try {
				const message = await gmail.users.messages.get({
					userId: "me",
					id: task.messageId,
					format: "full",
				});

				if (!message.data || !message.data.payload) {
					throw new Error("No message data found");
				}

				// Extract email content
				let content = "";
				if (message.data.payload.parts) {
					// Handle multipart messages
					for (const part of message.data.payload.parts) {
						if (part.mimeType === "text/plain" && part.body?.data) {
							content += Buffer.from(part.body.data, "base64").toString();
						}
					}
				} else if (message.data.payload.body?.data) {
					// Handle single part messages
					content = Buffer.from(message.data.payload.body.data, "base64").toString();
				}

				// Create frontmatter with email metadata
				const frontmatter = {
					from:
						message.data.payload.headers?.find((h) => h.name?.toLowerCase() === "from")?.value ||
						"Unknown",
					to: message.data.payload.headers?.find((h) => h.name?.toLowerCase() === "to")?.value,
					cc: message.data.payload.headers?.find((h) => h.name?.toLowerCase() === "cc")?.value,
					bcc: message.data.payload.headers?.find((h) => h.name?.toLowerCase() === "bcc")?.value,
					date: message.data.internalDate
						? new Date(Number.parseInt(message.data.internalDate)).toISOString()
						: undefined,
					subject: task.title,
				};

				// Combine frontmatter with content
				const contentWithFrontmatter = `---
from: ${frontmatter.from}${frontmatter.to ? `\nto: ${frontmatter.to}` : ""}${frontmatter.cc ? `\ncc: ${frontmatter.cc}` : ""}${frontmatter.bcc ? `\nbcc: ${frontmatter.bcc}` : ""}
date: ${frontmatter.date || "Unknown"}
subject: ${frontmatter.subject}
---

${content}`;

				await exportFile({
					workspaceId: token.workspace_id,
					task: {
						content: contentWithFrontmatter,
						metadata: {
							fileId: task.messageId,
							fileName: task.title,
							remoteUrl: task.remoteUrl,
							provider: providerSchemas.googleGmailSchema.identifier,
							tokenId: task.tokenId,
							mimeType: "text/plain",
							sgid: makeSgid({
								contentSignature: contentWithFrontmatter,
								sourceId: task.messageId,
								providerId: providerSchemas.googleGmailSchema.identifier,
							}),
						},
					},
				});
			} catch (error) {
				console.error(error);
				throw error;
			}
		}
	},
	indexing: async ({ task, queue }) => {
		const token = await getToken(task);
		const gmail = getGmail({
			accessToken: token.decrypted_tokenset.data.accessToken,
		});

		const tasks: z.infer<typeof providerSchemas.googleGmailSchema.internalTask>[] = [];
		let pageToken: string | undefined;

		while (true) {
			const response = await gmail.users.messages.list({
				userId: "me",
				maxResults: 100,
				pageToken,
			});

			if (!response.data.messages) {
				break;
			}

			for (const message of response.data.messages) {
				if (!message.id) continue;

				// Get message details to extract subject
				const details = await gmail.users.messages.get({
					userId: "me",
					id: message.id,
					format: "metadata",
					metadataHeaders: ["subject"],
				});

				const subject =
					details.data.payload?.headers?.find((header) => header.name?.toLowerCase() === "subject")
						?.value || "No Subject";

				tasks.push({
					step: "pending" as const,
					messageId: message.id,
					tokenId: task.tokenId,
					title: subject,
					remoteUrl: `https://mail.google.com/mail/u/0/#inbox/${message.id}`,
				});
			}

			if (!response.data.nextPageToken) {
				break;
			}
			pageToken = response.data.nextPageToken;
		}

		queue.batchQueue(tasks);
	},
});
