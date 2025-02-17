-- Create schemas
CREATE SCHEMA IF NOT EXISTS private;

-- Revoke public access from private schema
REVOKE ALL ON SCHEMA private
FROM
  PUBLIC;

-- Move the decrypted views to the private schema
ALTER VIEW public.tokens_with_decrypted_tokenset
SET SCHEMA private;

ALTER VIEW public.destinations_with_decrypted_params
SET SCHEMA private;

ALTER VIEW public.integrations_with_decrypted_credentials
SET SCHEMA private;

ALTER VIEW public.workspace_with_decrypted_api_key
SET SCHEMA private;

ALTER TABLE public.auth_sessions
SET SCHEMA private;

ALTER VIEW public.valid_auth_sessions
SET SCHEMA private;

ALTER TABLE public.portal_sessions
SET SCHEMA private;

ALTER VIEW public.valid_portal_sessions
SET SCHEMA private;

ALTER TABLE public.tokens
SET SCHEMA private;

-- Enable Row Level Security
ALTER TABLE public.workspace ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.end_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Workspace policy (direct ownership)
CREATE POLICY workspace_access ON public.workspace FOR ALL USING (owner_user_id = auth.uid ());

-- Integrations policy (workspace ownership)
CREATE POLICY integration_access ON public.integrations FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = auth.uid ()
  )
);

-- End Users policy (workspace ownership)
CREATE POLICY end_user_access ON public.end_users FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = auth.uid ()
  )
);

-- Destinations policy (workspace ownership)
CREATE POLICY destination_access ON public.destinations FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = auth.uid ()
  )
);

-- Grant necessary permissions to service role
GRANT USAGE ON SCHEMA private TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA private TO service_role;

GRANT ALL ON ALL FUNCTIONS IN SCHEMA private TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA private TO service_role;

-- Move the decrypt functions to the private schema
ALTER FUNCTION public.decrypt_destination_params
SET SCHEMA private;

ALTER FUNCTION public.decrypt_integration_credentials
SET SCHEMA private;

ALTER FUNCTION public.decrypt_tokenset
SET SCHEMA private;

ALTER FUNCTION public.encrypt_tokenset
SET SCHEMA private;

ALTER FUNCTION public.update_api_key
SET SCHEMA private;

ALTER FUNCTION public.queue_indexing_task
SET SCHEMA private;

ALTER FUNCTION public.initialize_workspace
SET SCHEMA private;

ALTER FUNCTION public.create_default_workspace
SET SCHEMA private;

-- Update triggers to use private schema functions
DROP TRIGGER IF EXISTS initialize_workspace_trigger ON public.workspace;

CREATE TRIGGER initialize_workspace_trigger BEFORE INSERT ON public.workspace FOR EACH ROW
EXECUTE FUNCTION private.initialize_workspace ();

DROP TRIGGER IF EXISTS create_default_workspace_trigger ON auth.users;

CREATE TRIGGER create_default_workspace_trigger
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION private.create_default_workspace ();
