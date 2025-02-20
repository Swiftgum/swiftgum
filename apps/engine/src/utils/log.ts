import { createPostgresDriver, initializeLogger, log } from "@knowledgex/shared/log";
import { sql } from "../db";

// Reuse the existing SQL connection pool
const logDriver = createPostgresDriver(sql);

initializeLogger(logDriver);

export { log };
