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
					claimed: boolean | null;
					configuration: Json;
					cookie_hash: string | null;
					created_at: string;
					end_user_id: string;
					expires_at: string;
					portal_session_id: string;
					workspace_id: string;
				};
				Insert: {
					claimed?: boolean | null;
					configuration: Json;
					cookie_hash?: string | null;
					created_at?: string;
					end_user_id: string;
					expires_at?: string;
					portal_session_id?: string;
					workspace_id: string;
				};
				Update: {
					claimed?: boolean | null;
					configuration?: Json;
					cookie_hash?: string | null;
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
			unclaimed_portal_sessions: {
				Row: {
					claimed: boolean | null;
					configuration: Json | null;
					cookie_hash: string | null;
					created_at: string | null;
					end_user_id: string | null;
					expires_at: string | null;
					portal_session_id: string | null;
					workspace_id: string | null;
				};
				Insert: {
					claimed?: boolean | null;
					configuration?: Json | null;
					cookie_hash?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					portal_session_id?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					claimed?: boolean | null;
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
					claimed: boolean | null;
					configuration: Json | null;
					cookie_hash: string | null;
					created_at: string | null;
					end_user_id: string | null;
					expires_at: string | null;
					portal_session_id: string | null;
					workspace_id: string | null;
				};
				Insert: {
					claimed?: boolean | null;
					configuration?: Json | null;
					cookie_hash?: string | null;
					created_at?: string | null;
					end_user_id?: string | null;
					expires_at?: string | null;
					portal_session_id?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					claimed?: boolean | null;
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
			claim_portal_session: {
				Args: {
					p_signed_payload: string;
					p_portal_session_id: string;
				};
				Returns: Database["private"]["CompositeTypes"]["portal_session_claim"];
			};
			cleanup_old_logs: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
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
			get_portal_session: {
				Args: {
					p_portal_session_id: string;
					p_cookie_nonce: string;
				};
				Returns: {
					claimed: boolean | null;
					configuration: Json;
					cookie_hash: string | null;
					created_at: string;
					end_user_id: string;
					expires_at: string;
					portal_session_id: string;
					workspace_id: string;
				};
			};
			get_workspace_by_api_key: {
				Args: {
					p_api_key: string;
				};
				Returns: {
					app_icon: string | null;
					app_name: string | null;
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
			};
			queue_indexing_task: {
				Args: {
					task: Json;
				};
				Returns: number;
			};
			rotate_api_key: {
				Args: {
					p_workspace_id: string;
				};
				Returns: string;
			};
			sign_portal_session: {
				Args: {
					p_portal_session_id: string;
					p_workspace_id: string;
				};
				Returns: string;
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
			portal_session_claim: {
				cookie_nonce: string | null;
				expires_at: string | null;
			};
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
			logs: {
				Row: {
					end_user_id: string | null;
					id: string | null;
					ingestion_time: string;
					level: string;
					log_id: string;
					metadata: Json | null;
					name: string;
					private: boolean;
					timestamp: string;
					type: string;
					user_id: string | null;
					workspace_id: string | null;
				};
				Insert: {
					end_user_id?: string | null;
					id?: string | null;
					ingestion_time?: string;
					level: string;
					log_id?: string;
					metadata?: Json | null;
					name: string;
					private?: boolean;
					timestamp: string;
					type: string;
					user_id?: string | null;
					workspace_id?: string | null;
				};
				Update: {
					end_user_id?: string | null;
					id?: string | null;
					ingestion_time?: string;
					level?: string;
					log_id?: string;
					metadata?: Json | null;
					name?: string;
					private?: boolean;
					timestamp?: string;
					type?: string;
					user_id?: string | null;
					workspace_id?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "logs_end_user_id_fkey";
						columns: ["end_user_id"];
						isOneToOne: false;
						referencedRelation: "end_users";
						referencedColumns: ["end_user_id"];
					},
					{
						foreignKeyName: "logs_workspace_id_fkey";
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
					app_icon: string | null;
					app_name: string | null;
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
					app_icon?: string | null;
					app_name?: string | null;
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
					app_icon?: string | null;
					app_name?: string | null;
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
			add_compression_policy: {
				Args: {
					hypertable: unknown;
					compress_after?: unknown;
					if_not_exists?: boolean;
					schedule_interval?: unknown;
					initial_start?: string;
					timezone?: string;
					compress_created_before?: unknown;
				};
				Returns: number;
			};
			add_continuous_aggregate_policy: {
				Args: {
					continuous_aggregate: unknown;
					start_offset: unknown;
					end_offset: unknown;
					schedule_interval: unknown;
					if_not_exists?: boolean;
					initial_start?: string;
					timezone?: string;
				};
				Returns: number;
			};
			add_dimension:
				| {
						Args: {
							hypertable: unknown;
							column_name: unknown;
							number_partitions?: number;
							chunk_time_interval?: unknown;
							partitioning_func?: unknown;
							if_not_exists?: boolean;
						};
						Returns: {
							dimension_id: number;
							schema_name: unknown;
							table_name: unknown;
							column_name: unknown;
							created: boolean;
						}[];
				  }
				| {
						Args: {
							hypertable: unknown;
							dimension: unknown;
							if_not_exists?: boolean;
						};
						Returns: {
							dimension_id: number;
							created: boolean;
						}[];
				  };
			add_job: {
				Args: {
					proc: unknown;
					schedule_interval: unknown;
					config?: Json;
					initial_start?: string;
					scheduled?: boolean;
					check_config?: unknown;
					fixed_schedule?: boolean;
					timezone?: string;
				};
				Returns: number;
			};
			add_reorder_policy: {
				Args: {
					hypertable: unknown;
					index_name: unknown;
					if_not_exists?: boolean;
					initial_start?: string;
					timezone?: string;
				};
				Returns: number;
			};
			add_retention_policy: {
				Args: {
					relation: unknown;
					drop_after?: unknown;
					if_not_exists?: boolean;
					schedule_interval?: unknown;
					initial_start?: string;
					timezone?: string;
					drop_created_before?: unknown;
				};
				Returns: number;
			};
			alter_job: {
				Args: {
					job_id: number;
					schedule_interval?: unknown;
					max_runtime?: unknown;
					max_retries?: number;
					retry_period?: unknown;
					scheduled?: boolean;
					config?: Json;
					next_start?: string;
					if_exists?: boolean;
					check_config?: unknown;
					fixed_schedule?: boolean;
					initial_start?: string;
					timezone?: string;
				};
				Returns: {
					job_id: number;
					schedule_interval: unknown;
					max_runtime: unknown;
					max_retries: number;
					retry_period: unknown;
					scheduled: boolean;
					config: Json;
					next_start: string;
					check_config: string;
					fixed_schedule: boolean;
					initial_start: string;
					timezone: string;
				}[];
			};
			approximate_row_count: {
				Args: {
					relation: unknown;
				};
				Returns: number;
			};
			attach_tablespace: {
				Args: {
					tablespace: unknown;
					hypertable: unknown;
					if_not_attached?: boolean;
				};
				Returns: undefined;
			};
			by_hash: {
				Args: {
					column_name: unknown;
					number_partitions: number;
					partition_func?: unknown;
				};
				Returns: unknown;
			};
			by_range: {
				Args: {
					column_name: unknown;
					partition_interval?: unknown;
					partition_func?: unknown;
				};
				Returns: unknown;
			};
			chunk_compression_stats: {
				Args: {
					hypertable: unknown;
				};
				Returns: {
					chunk_schema: unknown;
					chunk_name: unknown;
					compression_status: string;
					before_compression_table_bytes: number;
					before_compression_index_bytes: number;
					before_compression_toast_bytes: number;
					before_compression_total_bytes: number;
					after_compression_table_bytes: number;
					after_compression_index_bytes: number;
					after_compression_toast_bytes: number;
					after_compression_total_bytes: number;
					node_name: unknown;
				}[];
			};
			chunks_detailed_size: {
				Args: {
					hypertable: unknown;
				};
				Returns: {
					chunk_schema: unknown;
					chunk_name: unknown;
					table_bytes: number;
					index_bytes: number;
					toast_bytes: number;
					total_bytes: number;
					node_name: unknown;
				}[];
			};
			cleanup_expired_portal_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			cleanup_expired_sessions: {
				Args: Record<PropertyKey, never>;
				Returns: undefined;
			};
			compress_chunk: {
				Args: {
					uncompressed_chunk: unknown;
					if_not_compressed?: boolean;
					recompress?: boolean;
				};
				Returns: unknown;
			};
			create_encryption_key: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			create_hypertable:
				| {
						Args: {
							relation: unknown;
							dimension: unknown;
							create_default_indexes?: boolean;
							if_not_exists?: boolean;
							migrate_data?: boolean;
						};
						Returns: {
							hypertable_id: number;
							created: boolean;
						}[];
				  }
				| {
						Args: {
							relation: unknown;
							time_column_name: unknown;
							partitioning_column?: unknown;
							number_partitions?: number;
							associated_schema_name?: unknown;
							associated_table_prefix?: unknown;
							chunk_time_interval?: unknown;
							create_default_indexes?: boolean;
							if_not_exists?: boolean;
							partitioning_func?: unknown;
							migrate_data?: boolean;
							chunk_target_size?: string;
							chunk_sizing_func?: unknown;
							time_partitioning_func?: unknown;
						};
						Returns: {
							hypertable_id: number;
							schema_name: unknown;
							table_name: unknown;
							created: boolean;
						}[];
				  };
			decompress_chunk: {
				Args: {
					uncompressed_chunk: unknown;
					if_compressed?: boolean;
				};
				Returns: unknown;
			};
			delete_job: {
				Args: {
					job_id: number;
				};
				Returns: undefined;
			};
			detach_tablespace: {
				Args: {
					tablespace: unknown;
					hypertable?: unknown;
					if_attached?: boolean;
				};
				Returns: number;
			};
			detach_tablespaces: {
				Args: {
					hypertable: unknown;
				};
				Returns: number;
			};
			disable_chunk_skipping: {
				Args: {
					hypertable: unknown;
					column_name: unknown;
					if_not_exists?: boolean;
				};
				Returns: {
					hypertable_id: number;
					column_name: unknown;
					disabled: boolean;
				}[];
			};
			drop_chunks: {
				Args: {
					relation: unknown;
					older_than?: unknown;
					newer_than?: unknown;
					verbose?: boolean;
					created_before?: unknown;
					created_after?: unknown;
				};
				Returns: string[];
			};
			enable_chunk_skipping: {
				Args: {
					hypertable: unknown;
					column_name: unknown;
					if_not_exists?: boolean;
				};
				Returns: {
					column_stats_id: number;
					enabled: boolean;
				}[];
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
			get_telemetry_report: {
				Args: Record<PropertyKey, never>;
				Returns: Json;
			};
			gtrgm_compress: {
				Args: {
					"": unknown;
				};
				Returns: unknown;
			};
			gtrgm_decompress: {
				Args: {
					"": unknown;
				};
				Returns: unknown;
			};
			gtrgm_in: {
				Args: {
					"": unknown;
				};
				Returns: unknown;
			};
			gtrgm_options: {
				Args: {
					"": unknown;
				};
				Returns: undefined;
			};
			gtrgm_out: {
				Args: {
					"": unknown;
				};
				Returns: unknown;
			};
			hypertable_approximate_detailed_size: {
				Args: {
					relation: unknown;
				};
				Returns: {
					table_bytes: number;
					index_bytes: number;
					toast_bytes: number;
					total_bytes: number;
				}[];
			};
			hypertable_approximate_size: {
				Args: {
					hypertable: unknown;
				};
				Returns: number;
			};
			hypertable_compression_stats: {
				Args: {
					hypertable: unknown;
				};
				Returns: {
					total_chunks: number;
					number_compressed_chunks: number;
					before_compression_table_bytes: number;
					before_compression_index_bytes: number;
					before_compression_toast_bytes: number;
					before_compression_total_bytes: number;
					after_compression_table_bytes: number;
					after_compression_index_bytes: number;
					after_compression_toast_bytes: number;
					after_compression_total_bytes: number;
					node_name: unknown;
				}[];
			};
			hypertable_detailed_size: {
				Args: {
					hypertable: unknown;
				};
				Returns: {
					table_bytes: number;
					index_bytes: number;
					toast_bytes: number;
					total_bytes: number;
					node_name: unknown;
				}[];
			};
			hypertable_index_size: {
				Args: {
					index_name: unknown;
				};
				Returns: number;
			};
			hypertable_size: {
				Args: {
					hypertable: unknown;
				};
				Returns: number;
			};
			interpolate:
				| {
						Args: {
							value: number;
							prev?: Record<string, unknown>;
							next?: Record<string, unknown>;
						};
						Returns: number;
				  }
				| {
						Args: {
							value: number;
							prev?: Record<string, unknown>;
							next?: Record<string, unknown>;
						};
						Returns: number;
				  }
				| {
						Args: {
							value: number;
							prev?: Record<string, unknown>;
							next?: Record<string, unknown>;
						};
						Returns: number;
				  }
				| {
						Args: {
							value: number;
							prev?: Record<string, unknown>;
							next?: Record<string, unknown>;
						};
						Returns: number;
				  }
				| {
						Args: {
							value: number;
							prev?: Record<string, unknown>;
							next?: Record<string, unknown>;
						};
						Returns: number;
				  };
			locf: {
				Args: {
					value: unknown;
					prev?: unknown;
					treat_null_as_missing?: boolean;
				};
				Returns: unknown;
			};
			move_chunk: {
				Args: {
					chunk: unknown;
					destination_tablespace: unknown;
					index_destination_tablespace?: unknown;
					reorder_index?: unknown;
					verbose?: boolean;
				};
				Returns: undefined;
			};
			remove_compression_policy: {
				Args: {
					hypertable: unknown;
					if_exists?: boolean;
				};
				Returns: boolean;
			};
			remove_continuous_aggregate_policy: {
				Args: {
					continuous_aggregate: unknown;
					if_not_exists?: boolean;
					if_exists?: boolean;
				};
				Returns: undefined;
			};
			remove_reorder_policy: {
				Args: {
					hypertable: unknown;
					if_exists?: boolean;
				};
				Returns: undefined;
			};
			remove_retention_policy: {
				Args: {
					relation: unknown;
					if_exists?: boolean;
				};
				Returns: undefined;
			};
			reorder_chunk: {
				Args: {
					chunk: unknown;
					index?: unknown;
					verbose?: boolean;
				};
				Returns: undefined;
			};
			set_adaptive_chunking: {
				Args: {
					hypertable: unknown;
					chunk_target_size: string;
				};
				Returns: Record<string, unknown>;
			};
			set_chunk_time_interval: {
				Args: {
					hypertable: unknown;
					chunk_time_interval: unknown;
					dimension_name?: unknown;
				};
				Returns: undefined;
			};
			set_integer_now_func: {
				Args: {
					hypertable: unknown;
					integer_now_func: unknown;
					replace_if_exists?: boolean;
				};
				Returns: undefined;
			};
			set_limit: {
				Args: {
					"": number;
				};
				Returns: number;
			};
			set_number_partitions: {
				Args: {
					hypertable: unknown;
					number_partitions: number;
					dimension_name?: unknown;
				};
				Returns: undefined;
			};
			set_partitioning_interval: {
				Args: {
					hypertable: unknown;
					partition_interval: unknown;
					dimension_name?: unknown;
				};
				Returns: undefined;
			};
			show_chunks: {
				Args: {
					relation: unknown;
					older_than?: unknown;
					newer_than?: unknown;
					created_before?: unknown;
					created_after?: unknown;
				};
				Returns: unknown[];
			};
			show_limit: {
				Args: Record<PropertyKey, never>;
				Returns: number;
			};
			show_tablespaces: {
				Args: {
					hypertable: unknown;
				};
				Returns: unknown[];
			};
			show_trgm: {
				Args: {
					"": string;
				};
				Returns: string[];
			};
			time_bucket:
				| {
						Args: {
							bucket_width: number;
							ts: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
							offset: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
							offset: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
							offset: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							offset: unknown;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							offset: unknown;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							offset: unknown;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							origin: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							origin: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							origin: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							timezone: string;
							origin?: string;
							offset?: unknown;
						};
						Returns: string;
				  };
			time_bucket_gapfill:
				| {
						Args: {
							bucket_width: number;
							ts: number;
							start?: number;
							finish?: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
							start?: number;
							finish?: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: number;
							ts: number;
							start?: number;
							finish?: number;
						};
						Returns: number;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							start?: string;
							finish?: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							start?: string;
							finish?: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							start?: string;
							finish?: string;
						};
						Returns: string;
				  }
				| {
						Args: {
							bucket_width: unknown;
							ts: string;
							timezone: string;
							start?: string;
							finish?: string;
						};
						Returns: string;
				  };
			timescaledb_post_restore: {
				Args: Record<PropertyKey, never>;
				Returns: boolean;
			};
			timescaledb_pre_restore: {
				Args: Record<PropertyKey, never>;
				Returns: boolean;
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
