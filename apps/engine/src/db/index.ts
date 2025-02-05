import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not set");
}

export const sql = postgres(process.env.POSTGRES_URL);
