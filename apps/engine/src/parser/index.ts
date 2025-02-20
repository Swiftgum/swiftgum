/**
 * Runs the markitdown command to parse the markdown file with basic resource limits.
 * - Time limit: 120 seconds
 * - File size limit: 100MB
 */

import { exec as execCallback } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(execCallback);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const TIMEOUT_SECONDS = 120;

export const runMarkitdown = async (file: string) => {
	try {
		// Check file size
		const stats = await fs.stat(file);
		if (stats.size > MAX_FILE_SIZE) {
			throw new Error(
				`File size ${stats.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
			);
		}

		// Execute markitdown with timeout
		const { stdout, stderr } = await exec(`markitdown ${file}`, {
			timeout: TIMEOUT_SECONDS * 1000,
		});

		if (stderr) {
			throw new Error(stderr.trim());
		}

		return { textContents: stdout.trim() };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Failed to process markdown file: ${message}`);
	}
};
