import { providerSchemas } from "@knowledgex/shared/interfaces";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import type { z } from "zod";
import { makeSgid } from "../../export";
import { getToken } from "../../utils/token";
import { provider } from "../abstract";

// Define types for Notion API responses
type NotionPage = {
	id: string;
	object: string;
	properties?: Record<string, NotionProperty>;
};

type NotionProperty = {
	type: string;
	title?: { plain_text: string }[];
};

const getNotion = ({
	accessToken,
}: {
	accessToken: string;
}) => {
	return new Client({ auth: accessToken });
};

export const notionProvider = provider({
	schema: providerSchemas.notionSchema,
	internal: async ({ task, exportFile }) => {
		const token = await getToken(task);

		const notion = getNotion({
			accessToken: token.decrypted_tokenset.data.accessToken,
		});

		// Initialize the NotionToMarkdown converter
		const n2m = new NotionToMarkdown({ notionClient: notion });

		if (task.step === "pending") {
			try {
				// Fetch the page blocks (content)
				const mdBlocks = await n2m.pageToMarkdown(task.pageId);

				// Convert blocks to markdown string
				const mdString = n2m.toMarkdownString(mdBlocks);

				// Add title as H1 at the beginning if not already included
				const textContents = `# ${task.title}\n\n${mdString.parent}`;

				await exportFile({
					workspaceId: token.workspace_id,
					task: {
						content: textContents,
						metadata: {
							fileId: task.pageId,
							fileName: task.title,
							remoteUrl: task.remoteUrl,
							provider: providerSchemas.notionSchema.identifier,
							tokenId: task.tokenId,
							mimeType: "text/markdown",
							sgid: makeSgid({
								contentSignature: textContents,
								sourceId: task.pageId,
								providerId: providerSchemas.notionSchema.identifier,
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

		const notion = getNotion({
			accessToken: token.decrypted_tokenset.data.accessToken,
		});

		const tasks: z.infer<typeof providerSchemas.notionSchema.internalTask>[] = [];

		// Fetch all pages the user has access to
		const fetchPages = async (cursor?: string) => {
			try {
				// Search for all pages the user has access to
				const response = await notion.search({
					filter: {
						value: "page",
						property: "object",
					},
					start_cursor: cursor,
					page_size: 100,
				});

				for (const page of response.results as NotionPage[]) {
					if (page.object === "page") {
						// Get page title
						let title = "Untitled";

						// Handle different page title formats
						if (page.properties) {
							const titleProperty = Object.values(page.properties).find(
								(prop) => prop.type === "title",
							);

							if (titleProperty?.title) {
								title = titleProperty.title.map((text) => text.plain_text).join("") || "Untitled";
							}
						}

						// Create a task for this page
						tasks.push({
							step: "pending",
							pageId: page.id,
							tokenId: task.tokenId,
							title: title,
							remoteUrl: `https://notion.so/${page.id.replace(/-/g, "")}`,
						});
					}
				}

				// If there are more pages, fetch them
				if (response.has_more && response.next_cursor) {
					await fetchPages(response.next_cursor);
				}
			} catch (error) {
				console.error("Error fetching Notion pages:", error);
				throw error;
			}
		};

		await fetchPages();

		// Queue all the tasks
		queue.batchQueue(tasks);
	},
});
