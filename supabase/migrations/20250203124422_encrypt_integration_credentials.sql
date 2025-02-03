-- Function to encrypt integration credentials
CREATE FUNCTION public.encrypt_integration_credentials (p_workspace_id UUID, p_credentials JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the credentials using the workspace key
    RETURN pgp_sym_encrypt(
      p_credentials::text,
      encryption_key
    );
END;
$$;

-- Function to decrypt integration credentials
CREATE FUNCTION public.decrypt_integration_credentials (
  p_workspace_id UUID,
  p_encrypted_credentials BYTEA
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the credentials using the workspace key
    RETURN pgp_sym_decrypt(
        p_encrypted_credentials,
        encryption_key
    )::JSONB;
END;
$$;

CREATE VIEW public.integrations_with_decrypted_credentials AS
SELECT
  i.*,
  CASE
    WHEN i.encrypted_credentials IS NOT NULL THEN public.decrypt_integration_credentials (i.workspace_id, i.encrypted_credentials)
    ELSE NULL
  END AS decrypted_credentials
FROM
  public.integrations i;
