export const keepAlive = () => {
	const url = process.env.KEEPALIVE_URL;

	if (!url) {
		return;
	}

	void fetch(url);
};
