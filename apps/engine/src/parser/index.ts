/**
 * Runs the uv run markitdown command to parse the markdown file.
 */

import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCallback);

export const runMarkitdown = async (file: string) => {
	const { stdout, stderr } = await exec(`markitdown ${file}`, {
		cwd: process.cwd(),
	});

	if (stderr.trim().length > 0) {
		throw new Error(stderr);
	}

	return {
		textContents: stdout.trim(),
	};
};
