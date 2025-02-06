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
		await fs.unlink(tempFile);
	}, lifetime);

	return {
		async cleanup() {
			await fs.unlink(tempFile);
		},
		tempFile,
	};
};
