import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const TEMP_DIR = "/tmp";

export const tempFileName = async (
	extension: string,
	prefix = "tmp-",
	lifetime: number = 5 * 60 * 1000,
) => {
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
