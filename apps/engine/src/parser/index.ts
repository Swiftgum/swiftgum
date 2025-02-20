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
	// Check file size
	const stats = await fs.stat(file);
	if (stats.size > MAX_FILE_SIZE) {
		throw new Error(
			`File size ${stats.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
		);
	}

	// Execute markitdown with timeout
	const { stdout, stderr, status } = await exec(`markitdown ${file}`, {
		timeout: TIMEOUT_SECONDS * 1000,
	})
		.then((result) => ({ ...result, status: 0 }))
		.catch((error) => {
			if ("status" in error) {
				return { stdout: error.stdout, stderr: error.stderr, status: error.status };
			}
			throw error;
		});

	// Only throw if we have a non-zero exit code
	if (status !== 0) {
		const output = [stdout, stderr].filter(Boolean).join("\n").trim();
		throw new Error(`Markitdown failed with status ${status}:\n${output}`);
	}

	return { textContents: stdout.trim() };
};
