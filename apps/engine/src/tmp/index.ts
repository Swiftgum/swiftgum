import { randomUUID } from "node:crypto";
import { mkdirSync, readdirSync, rmSync } from "node:fs";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const TEMP_DIR = "/tmp/engine";

const ensureTempDirectory = () => {
	mkdirSync(TEMP_DIR, { recursive: true });
};

const clearTempDirectory = () => {
	ensureTempDirectory();

	const files = readdirSync(TEMP_DIR);
	for (const file of files) {
		rmSync(path.join(TEMP_DIR, file), { recursive: true, force: true });
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
