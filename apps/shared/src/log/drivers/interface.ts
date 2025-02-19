import type { Database } from "../../types/database-server";

export type BackendDriver = {
	insert: (
		entry: Omit<Database["public"]["Tables"]["logs"]["Insert"], "ingestion_time">,
	) => Promise<void>;
	close: () => Promise<void>;
};

export type CreateBackendDriver<TConnection> = (connection: TConnection) => BackendDriver;
