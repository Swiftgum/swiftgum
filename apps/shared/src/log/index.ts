import type { BackendDriver } from "./drivers/interface";
import { type Log, type LogInput, logEvent } from "./types";
import { resourceUri } from "./uri";

export * from "./drivers";
export * from "./uri";
export type { LogInput, Log };
export { resourceUri };
export type { QueueName } from "./types";
export type LogLevel = Log["level"];
export type LogType = Log["type"];
export type LogName = Log["name"];

export type LogMiddleware = (input: LogInput) => LogInput | Promise<LogInput>;

let _driver: BackendDriver | null = null;
let _middleware: LogMiddleware | null = null;

export function initializeLogger(driver: BackendDriver, replace = false) {
	if (_driver && !replace) {
		console.warn(
			"Logger already initialized. If you want to replace the driver, set the replace flag to true.",
		);
		return;
	}

	if (_driver) _driver.close();

	_driver = driver;
}

export function addMiddleware(middleware: LogMiddleware) {
	_middleware = middleware;
}

export async function log(input: LogInput) {
	if (!_driver) {
		throw new Error("Logger not initialized. Call initializeLogger first.");
	}

	// Apply middleware if exists
	const processedInput = _middleware ? await _middleware(input) : input;

	const logEntry = logEvent.parse({
		...processedInput,
		timestamp: processedInput.timestamp ?? new Date().toISOString(),
		id: resourceUri(processedInput.id || {}),
	});

	await _driver.insert(logEntry);
}

// Cleanup function to be called when shutting down the application
export async function closeLogger() {
	if (_driver) {
		await _driver.close();
		_driver = null;
	}
	_middleware = null;
}
