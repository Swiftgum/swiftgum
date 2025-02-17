-- Redeclare functions with lacking search paths
-- public.encrypt_integration_credentials
CREATE OR REPLACE FUNCTION public.encrypt_integration_credentials (p_workspace_id UUID, p_credentials JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the credentials using the workspace key
    RETURN extensions.pgp_sym_encrypt(
      p_credentials::text,
      encryption_key
    );
END;
$$;

-- public.encrypt_destination_params
CREATE OR REPLACE FUNCTION public.encrypt_destination_params (p_workspace_id UUID, p_params JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the params using the workspace key
    RETURN extensions.pgp_sym_encrypt(
      p_params::text,
      encryption_key
    );
END;
$$;

-- private.decrypt_destination_params
CREATE OR REPLACE FUNCTION private.decrypt_destination_params (p_workspace_id UUID, p_encrypted_params BYTEA) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the params using the workspace key
    RETURN extensions.pgp_sym_decrypt(
        p_encrypted_params,
        encryption_key
    )::JSONB;
END;
$$;

-- private.decrypt_integration_credentials
CREATE OR REPLACE FUNCTION private.decrypt_integration_credentials (
  p_workspace_id UUID,
  p_encrypted_credentials BYTEA
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the credentials using the workspace key
    RETURN extensions.pgp_sym_decrypt(
        p_encrypted_credentials,
        encryption_key
    )::JSONB;
END;
$$;

-- private.decrypt_tokenset
CREATE OR REPLACE FUNCTION private.decrypt_tokenset (p_workspace_id UUID, p_encrypted_tokenset BYTEA) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the tokenset using the workspace key
    RETURN extensions.pgp_sym_decrypt(
        p_encrypted_tokenset,
        encryption_key
    )::JSONB;
END;
$$;

-- private.encrypt_tokenset
CREATE OR REPLACE FUNCTION private.encrypt_tokenset (p_workspace_id UUID, p_tokenset JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the tokenset using the workspace key
    RETURN extensions.pgp_sym_encrypt(
      p_tokenset::text,
      encryption_key
    );
END;
$$;

-- Create RLS Policies
-- Workspace policy (direct ownership)
DROP POLICY IF EXISTS workspace_access ON public.workspace;

CREATE POLICY workspace_access ON public.workspace FOR ALL USING (
  owner_user_id = (
    SELECT
      auth.uid ()
  )
);

-- Integrations policy (workspace ownership)
DROP POLICY IF EXISTS integration_access ON public.integrations;

CREATE POLICY integration_access ON public.integrations FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = (
        SELECT
          auth.uid ()
      )
  )
);

-- End Users policy (workspace ownership)
DROP POLICY IF EXISTS end_user_access ON public.end_users;

CREATE POLICY end_user_access ON public.end_users FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = (
        SELECT
          auth.uid ()
      )
  )
);

-- Destinations policy (workspace ownership)
DROP POLICY IF EXISTS destination_access ON public.destinations;

CREATE POLICY destination_access ON public.destinations FOR ALL USING (
  workspace_id IN (
    SELECT
      workspace_id
    FROM
      public.workspace
    WHERE
      owner_user_id = (
        SELECT
          auth.uid ()
      )
  )
);
