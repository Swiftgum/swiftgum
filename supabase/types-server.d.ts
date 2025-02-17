export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	private: {
		Tables: {
			auth_sessions: {
				Row: {
					auth_session: Json;
					auth_session_id: string;
					claimed_at: string | null;
					created_at: string | null;
					end_user_id: string;
					integration_id: string;
				};
				Insert: {
					auth_session: Json;
					auth_session_id?: string;
					claimed_at?: string | null;
					created_at?: string | null;
					end_user_id: string;
					integration_id: string;
				};
				Update: {
					auth_session?: Json;
					auth_session_id?: string;
					claimed_at?: string | null;
					created_at?: string | null;
					end_user_id?: string;
					integration_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "fk_auth_sessions_integration_id";
						columns: ["integration_id"];
						isOneToOne: false;
						referencedRelation: "integrations_with_decrypted_credentials";
						referencedColumns: ["integration_id"];
					},
				];
			};
			portal_sessions: {
				Row: {
					configuration: Json;
					cookie_hash: string;
					created_at: string;
					end_user_id: string;
					expires_at: string;
					portal_session_id: string;
					workspace_id: string;
				};
				Insert: {
					configuration: Json;
					cookie_hash: string;
					created_at?: string;
					end_user_id: string;
					expires_at?: string;
					portal_session_id?: string;
					workspace_id: string;
				};
				Update: {
					configuration?: Json;
					cookie_hash?: string;
					created_at?: string;
					end_user_id?: string;
					expires_at?: string;
					portal_session_id?: string;
					workspace_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "portal_sessions_workspace_id_fkey";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			tokens: {
				Row: {
					created_at: string;
					encrypted_tokenset: string;
					end_user_id: string;
					expires_at: string | null;
					integration_id: string;
					refreshed_at: string;
					revoked_at: string | null;
					token_id: string;
					workspace_id: string;
				};
				Insert: {
					created_at?: string;
					encrypted_tokenset: string;
					end_user_id: string;
					expires_at?: string | null;
					integration_id: string;
					refreshed_at?: string;
					revoked_at?: string | null;
					token_id?: string;
					workspace_id: string;
				};
				Update: {
					created_at?: string;
					encrypted_tokenset?: string;
					end_user_id?: string;
					expires_at?: string | null;
					integration_id?: string;
					refreshed_at?: string;
					revoked_at?: string | null;
					token_id?: string;
					workspace_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "fk_integration";
						columns: ["integration_id"];
						isOneToOne: false;
						referencedRelation: "integrations_with_decrypted_credentials";
						referencedColumns: ["integration_id"];
					},
					{
						foreignKeyName: "fk_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
		};
		Views: {
			destinations_with_decrypted_params: {
				Row: {
					created_at: string | null;
					decrypted_destination_params: Json | null;
					destination_id: string | null;
					encrypted_destination_params: string | null;
					updated_at: string | null;
					workspace_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					decrypted_destination_params?: never;
					destination_id?: string | null;
					encrypted_destination_params?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					decrypted_destination_params?: never;
					destination_id?: string | null;
					encrypted_destination_params?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "fk_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			integrations_with_decrypted_credentials: {
				Row: {
					created_at: string | null;
					decrypted_credentials: Json | null;
					enabled: boolean | null;
					encrypted_credentials: string | null;
					integration_id: string | null;
					provider_id: string | null;
					updated_at: string | null;
					workspace_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					decrypted_credentials?: never;
					enabled?: boolean | null;
					encrypted_credentials?: string | null;
					integration_id?: string | null;
					provider_id?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					decrypted_credentials?: never;
					enabled?: boolean | null;
					encrypted_credentials?: string | null;
					integration_id?: string | null;
					provider_id?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "fk_integrations_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			tokens_with_decrypted_tokenset: {
				Row: {
					created_at: string | null;
					decrypted_tokenset: Json | null;
					encrypted_tokenset: string | null;
					end_user_id: string | null;
					expires_at: string | null;
					integration_id: string | null;
					refreshed_at: string | null;
					revoked_at: string | null;
					token_id: string | null;
					workspace_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					decrypted_tokenset?: never;
					encrypted_tokenset?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					integration_id?: string | null;
					refreshed_at?: string | null;
					revoked_at?: string | null;
					token_id?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					decrypted_tokenset?: never;
					encrypted_tokenset?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					integration_id?: string | null;
					refreshed_at?: string | null;
					revoked_at?: string | null;
					token_id?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "fk_integration";
						columns: ["integration_id"];
						isOneToOne: false;
						referencedRelation: "integrations_with_decrypted_credentials";
						referencedColumns: ["integration_id"];
					},
					{
						foreignKeyName: "fk_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			valid_auth_sessions: {
				Row: {
					auth_session: Json | null;
					auth_session_id: string | null;
					claimed_at: string | null;
					created_at: string | null;
					end_user_id: string | null;
					integration_id: string | null;
				};
				Insert: {
					auth_session?: Json | null;
					auth_session_id?: string | null;
					claimed_at?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					integration_id?: string | null;
				};
				Update: {
					auth_session?: Json | null;
					auth_session_id?: string | null;
					claimed_at?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					integration_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "fk_auth_sessions_integration_id";
						columns: ["integration_id"];
						isOneToOne: false;
						referencedRelation: "integrations_with_decrypted_credentials";
						referencedColumns: ["integration_id"];
					},
				];
			};
			valid_portal_sessions: {
				Row: {
					configuration: Json | null;
					cookie_hash: string | null;
					created_at: string | null;
					end_user_id: string | null;
					expires_at: string | null;
					portal_session_id: string | null;
					workspace_id: string | null;
				};
				Insert: {
					configuration?: Json | null;
					cookie_hash?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					portal_session_id?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					configuration?: Json | null;
					cookie_hash?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					portal_session_id?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "portal_sessions_workspace_id_fkey";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace_with_decrypted_api_key";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			workspace_with_decrypted_api_key: {
				Row: {
					created_at: string | null;
					decrypted_api_key: string | null;
					encrypted_api_key: string | null;
					encryption_key_id: string | null;
					hashed_api_key: string | null;
					label: string | null;
					owner_user_id: string | null;
					updated_at: string | null;
					workspace_id: string | null;
				};
				Insert: {
					created_at?: string | null;
					decrypted_api_key?: never;
					encrypted_api_key?: string | null;
					encryption_key_id?: string | null;
					hashed_api_key?: string | null;
					label?: string | null;
					owner_user_id?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					created_at?: string | null;
					decrypted_api_key?: never;
					encrypted_api_key?: string | null;
					encryption_key_id?: string | null;
					hashed_api_key?: string | null;
					label?: string | null;
					owner_user_id?: string | null;
					updated_at?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [];
			};
		};
		Functions: {
			decrypt_destination_params: {
				Args: {
					p_workspace_id: string;
					p_encrypted_params: string;
				};
				Returns: Json;
			};
			decrypt_integration_credentials: {
				Args: {
					p_workspace_id: string;
					p_encrypted_credentials: string;
				};
				Returns: Json;
			};
			decrypt_tokenset: {
				Args: {
					p_workspace_id: string;
					p_encrypted_tokenset: string;
				};
				Returns: Json;
			};
			encrypt_tokenset: {
				Args: {
					p_workspace_id: string;
					p_tokenset: Json;
				};
				Returns: string;
			};
			queue_indexing_task: {
				Args: {
					task: Json;
				};
				Returns: number;
			};
			update_api_key: {
				Args: {
					p_workspace_id: string;
					api_key: string;
				};
				Returns: undefined;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			destinations: {
				Row: {
					created_at: string;
					destination_id: string;
					encrypted_destination_params: string;
					updated_at: string;
					workspace_id: string;
				};
				Insert: {
					created_at?: string;
					destination_id?: string;
					encrypted_destination_params: string;
					updated_at?: string;
					workspace_id: string;
				};
				Update: {
					created_at?: string;
					destination_id?: string;
					encrypted_destination_params?: string;
					updated_at?: string;
					workspace_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "fk_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			end_users: {
				Row: {
					created_at: string | null;
					end_user_id: string;
					foreign_id: string;
					updated_at: string | null;
					workspace_id: string;
				};
				Insert: {
					created_at?: string | null;
					end_user_id?: string;
					foreign_id: string;
					updated_at?: string | null;
					workspace_id: string;
				};
				Update: {
					created_at?: string | null;
					end_user_id?: string;
					foreign_id?: string;
					updated_at?: string | null;
					workspace_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "fk_end_users_workspace_id";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			integrations: {
				Row: {
					created_at: string;
					enabled: boolean;
					encrypted_credentials: string | null;
					integration_id: string;
					provider_id: string;
					updated_at: string;
					workspace_id: string;
				};
				Insert: {
					created_at?: string;
					enabled?: boolean;
					encrypted_credentials?: string | null;
					integration_id?: string;
					provider_id: string;
					updated_at?: string;
					workspace_id: string;
				};
				Update: {
					created_at?: string;
					enabled?: boolean;
					encrypted_credentials?: string | null;
					integration_id?: string;
					provider_id?: string;
					updated_at?: string;
					workspace_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "fk_integrations_provider";
						columns: ["provider_id"];
						isOneToOne: false;
						referencedRelation: "providers";
						referencedColumns: ["provider_id"];
					},
					{
						foreignKeyName: "fk_integrations_workspace";
						columns: ["workspace_id"];
						isOneToOne: false;
						referencedRelation: "workspace";
						referencedColumns: ["workspace_id"];
					},
				];
			};
			providers: {
				Row: {
					created_at: string;
					description: string | null;
					identifier: string;
					metadata: Json;
					name: string;
					provider_id: string;
					updated_at: string;
				};
				Insert: {
					created_at?: string;
					description?: string | null;
					identifier: string;
					metadata?: Json;
					name: string;
					provider_id?: string;
					updated_at?: string;
				};
				Update: {
					created_at?: string;
					description?: string | null;
					identifier?: string;
					metadata?: Json;
					name?: string;
					provider_id?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
			workspace: {
				Row: {
					created_at: string;
					dns_name: string;
					encrypted_api_key: string;
					encryption_key_id: string;
					hashed_api_key: string;
					label: string | null;
					owner_user_id: string;
					updated_at: string;
					workspace_id: string;
				};
				Insert: {
					created_at?: string;
					dns_name?: string;
					encrypted_api_key: string;
					encryption_key_id: string;
					hashed_api_key: string;
					label?: string | null;
					owner_user_id: string;
					updated_at?: string;
					workspace_id?: string;
				};
				Update: {
					created_at?: string;
					dns_name?: string;
					encrypted_api_key?: string;
					encryption_key_id?: string;
					hashed_api_key?: string;
					label?: string | null;
					owner_user_id?: string;
					updated_at?: string;
					workspace_id?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			cleanup_expired_portal_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			cleanup_expired_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			create_encryption_key: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			encrypt_destination_params: {
				Args: {
					p_workspace_id: string;
					p_params: Json;
				};
				Returns: string;
			};
			encrypt_integration_credentials: {
				Args: {
					p_workspace_id: string;
					p_credentials: Json;
				};
				Returns: string;
			};
			generate_dns_name: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
				Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
			Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;
