import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const TEMP_DIR = "/tmp/engine";

const ensureTempDirectory = async () => {
	await fs.mkdir(TEMP_DIR, { recursive: true });
};

const clearTempDirectory = async () => {
	await ensureTempDirectory();

	const files = await fs.readdir(TEMP_DIR);
	for (const file of files) {
		await fs.unlink(path.join(TEMP_DIR, file));
	}
};

clearTempDirectory();

export const tempFileName = async ({
	extension,
	prefix = "tmp-",
	lifetime = 5 * 60 * 1000,
}: {
	extension: string;
	prefix?: string;
	lifetime?: number;
}) => {
	const tempFile = path.join(TEMP_DIR, `${prefix}${randomUUID()}.${extension}`);

	setTimeout(async () => {
		try {
			await fs.unlink(tempFile);
		} catch (err) {
			// Check if the file is already deleted
			if (err instanceof Error && err.message.includes("ENOENT")) {
				return;
			}

			throw err;
		}
	}, lifetime);

	return {
		async cleanup() {
			try {
				await fs.unlink(tempFile);
			} catch (err) {
				// Check if the file is already deleted
				if (err instanceof Error && err.message.includes("ENOENT")) {
					return;
				}

				throw err;
			}
		},
		tempFile,
	};
};
