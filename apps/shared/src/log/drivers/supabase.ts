import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../types/database-server";
import type { CreateBackendDriver } from "./interface";

export const createSupabaseDriver: CreateBackendDriver<SupabaseClient<Database>> = (client) => {
	return {
		insert: async (entry: Database["public"]["Tables"]["logs"]["Insert"]): Promise<void> => {
			const { error } = await client.from("logs").insert(entry);

			if (error) {
				throw error;
			}
		},

		close: async (): Promise<void> => {
			// Supabase client doesn't need explicit cleanup
		},
	};
};
