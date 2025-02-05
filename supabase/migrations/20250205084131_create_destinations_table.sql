CREATE TABLE destinations (
  destination_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  workspace_id UUID NOT NULL,
  encrypted_destination_params BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add fk to workspace
ALTER TABLE destinations
ADD CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspace (workspace_id);

-- Function to encrypt destination params
CREATE FUNCTION public.encrypt_destination_params (p_workspace_id UUID, p_params JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the params using the workspace key
    RETURN pgp_sym_encrypt(
      p_params::text,
      encryption_key
    );
END;
$$;

-- Function to decrypt destination params
CREATE FUNCTION public.decrypt_destination_params (p_workspace_id UUID, p_encrypted_params BYTEA) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the params using the workspace key
    RETURN pgp_sym_decrypt(
        p_encrypted_params,
        encryption_key
    )::JSONB;
END;
$$;

-- View with decrypted destination params
CREATE VIEW public.destinations_with_decrypted_params AS
SELECT
  d.*,
  CASE
    WHEN d.encrypted_destination_params IS NOT NULL THEN public.decrypt_destination_params (d.workspace_id, d.encrypted_destination_params)
    ELSE NULL
  END AS decrypted_destination_params
FROM
  public.destinations d;
