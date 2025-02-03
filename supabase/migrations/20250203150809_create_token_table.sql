CREATE TABLE tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  workspace_id UUID NOT NULL,
  end_user_id UUID NOT NULL,
  integration_id UUID NOT NULL,
  encrypted_tokenset BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  refreshed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP
);

-- Add fk to end_users, workspace and integrations
ALTER TABLE tokens
ADD CONSTRAINT fk_end_user FOREIGN KEY (end_user_id) REFERENCES end_users (end_user_id);

ALTER TABLE tokens
ADD CONSTRAINT fk_workspace FOREIGN KEY (workspace_id) REFERENCES workspace (workspace_id);

ALTER TABLE tokens
ADD CONSTRAINT fk_integration FOREIGN KEY (integration_id) REFERENCES integrations (integration_id);

-- Function to encrypt tokenset
CREATE FUNCTION public.encrypt_tokenset (p_workspace_id UUID, p_tokenset JSONB) RETURNS BYTEA LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Encrypt the tokenset using the workspace key
    RETURN pgp_sym_encrypt(
      p_tokenset::text,
      encryption_key
    );
END;
$$;

-- Function to decrypt tokenset
CREATE FUNCTION public.decrypt_tokenset (p_workspace_id UUID, p_encrypted_tokenset BYTEA) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    encryption_key text;
BEGIN
    -- Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    -- Decrypt the tokenset using the workspace key
    RETURN pgp_sym_decrypt(
        p_encrypted_tokenset,
        encryption_key
    )::JSONB;
END;
$$;

-- View with decrypted tokenset
CREATE VIEW public.tokens_with_decrypted_tokenset AS
SELECT
  t.*,
  CASE
    WHEN t.encrypted_tokenset IS NOT NULL THEN public.decrypt_tokenset (t.workspace_id, t.encrypted_tokenset)
    ELSE NULL
  END AS decrypted_tokenset
FROM
  public.tokens t;
