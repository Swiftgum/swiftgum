import { createPostgresDriver, initializeLogger, log } from "@knowledgex/shared/log";
import "../db";
import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not set");
}

const logDriver = createPostgresDriver(postgres(process.env.POSTGRES_URL));

initializeLogger(logDriver);

export { log };
