/**
 * Runs the markitdown command to parse the markdown file with basic resource limits.
 * - Time limit: 120 seconds
 * - File size limit: 100MB
 */

import { exec as execCallback } from "node:child_process";
import fs from "node:fs/promises";
import { promisify } from "node:util";
import { FinalQueueError, QueueError } from "../queue";

const exec = promisify(execCallback);

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const TIMEOUT_SECONDS = 120;

interface ExecError extends Error {
	code?: string;
	stdout?: string;
	stderr?: string;
}

export const runMarkitdown = async (file: string) => {
	try {
		// Check file size
		const stats = await fs.stat(file);
		if (stats.size > MAX_FILE_SIZE) {
			throw new FinalQueueError(
				`File size ${stats.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`,
			);
		}

		// Execute markitdown with timeout
		const result = await exec(`markitdown ${file}`, {
			timeout: TIMEOUT_SECONDS * 1000,
			killSignal: "SIGKILL", // Use SIGKILL instead of SIGTERM for harder termination
		});

		return { textContents: result.stdout.trim() };
	} catch (error) {
		const execError = error as ExecError;

		// Handle specific error cases
		if (execError.code === "ETIMEDOUT") {
			throw new QueueError(`Markitdown process timed out after ${TIMEOUT_SECONDS} seconds`);
		}

		// For exec errors, include both stdout and stderr in the error message
		if (execError.stdout || execError.stderr) {
			const output = [execError.stdout, execError.stderr].filter(Boolean).join("\n").trim();
			throw new Error(`Markitdown process failed: ${output}`);
		}

		// For other errors, pass through the error message
		throw new Error(`Markitdown process failed: ${execError.message || String(error)}`);
	}
};
