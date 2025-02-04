import type { Provider } from "./abstract";

const HARD_PAGE_LIMIT = 100;

const fetchPage = async (accessToken: string, pageToken?: string) => {
	const url = new URL("https://www.googleapis.com/drive/v3/files");

	url.searchParams.set("trashed", "false");
	url.searchParams.set("orderBy", "recency");
	url.searchParams.set("pageSize", "1000");

	if (pageToken) url.searchParams.set("pageToken", pageToken);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data = await response.json();

	const { nextPageToken, files } = data;

	return { nextPageToken, files };
};

const fetchAllPages = async (accessToken: string) => {
	let { files, nextPageToken } = await fetchPage(accessToken);
	let i = 0;

	while (nextPageToken && i < HARD_PAGE_LIMIT) {
		i++;

		const { files: pageFiles, nextPageToken: nextPage } = await fetchPage(
			accessToken,
			nextPageToken,
		);

		files.push(...pageFiles);

		nextPageToken = nextPage;
	}

	return;
};

export const googleDriveProvider: Provider<"google:drive"> = {
	type: "google:drive" as const,
	index: async (task) => {
		const files = await fetchAllPages(task.accessToken);
	},
};
