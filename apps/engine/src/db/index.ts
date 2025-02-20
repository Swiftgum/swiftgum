import postgres from "postgres";

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not set");
}

// Configure connection pool settings for use with Supabase transaction pooler
export const sql = postgres(process.env.POSTGRES_URL, {
	max: 10, // Maximum number of connections in pool
	idle_timeout: 20, // Close idle connections after 20 seconds
	connect_timeout: 10, // Connection timeout after 10 seconds
	prepare: false, // Disable prepared statements as they're not supported by transaction pooler
	ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Export a function to explicitly close the pool when needed
export const closePool = async () => {
	await sql.end();
};
