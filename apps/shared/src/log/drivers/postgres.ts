import type postgres from "postgres";
import type { Database } from "../../types/database-server";
import type { CreateBackendDriver } from "./interface";

export const createPostgresDriver: CreateBackendDriver<postgres.Sql> = (sql) => {
	return {
		insert: async (entry: Database["public"]["Tables"]["logs"]["Insert"]): Promise<void> => {
			await sql`
				INSERT INTO logs ${sql(entry)}
			`;
		},

		close: async (): Promise<void> => {
			await sql.end();
		},
	};
};
