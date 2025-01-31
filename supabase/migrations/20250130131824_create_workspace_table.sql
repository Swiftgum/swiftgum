-- 1. workspace
CREATE TABLE public.workspace (
    workspace_id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    owner_user_id UUID NOT NULL,
    encryption_key_id UUID NOT NULL,
    encrypted_api_key text NOT NULL,
    hashed_api_key text NOT NULL,
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace
ADD CONSTRAINT fk_workspace_owner FOREIGN KEY (owner_user_id) REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE FUNCTION public.create_encryption_key () RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    RETURN encode(extensions.gen_random_bytes(128), 'hex');
END;
$$;

CREATE FUNCTION public.initialize_workspace () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    encryption_key text;
    api_key text;
BEGIN
    encryption_key := public.create_encryption_key();
    api_key := encode(extensions.gen_random_bytes(64), 'hex');
    NEW.encryption_key_id = vault.create_secret(
        encryption_key,
        'encryption_key@' || NEW.workspace_id,
        'Workspace encryption key'
    );
    NEW.encrypted_api_key = encode(extensions.pgp_sym_encrypt(api_key, encryption_key), 'hex');
    NEW.hashed_api_key = extensions.crypt(api_key, extensions.gen_salt('bf'));
    RETURN NEW;
END;
$$;

CREATE FUNCTION public.update_api_key (p_workspace_id UUID, api_key TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    UPDATE public.workspace
    SET encrypted_api_key = encode(
            extensions.pgp_sym_encrypt(
                api_key,
                (
                    SELECT decrypted_secret
                    FROM vault.decrypted_secrets
                    WHERE id = encryption_key_id
                )
            ),
            'hex'
        ),
        hashed_api_key = extensions.crypt(api_key, extensions.gen_salt('bf'))
    WHERE workspace_id = p_workspace_id;
END;
$$;

CREATE FUNCTION public.create_default_workspace () RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
BEGIN
    INSERT INTO public.workspace (
      owner_user_id,
      label
    )
    VALUES (
      NEW.id,
      'Default Workspace'
    );
    RETURN NEW;
END;
$$;

-- Create a view that has the decrypted api key
CREATE VIEW public.workspace_with_decrypted_api_key AS
SELECT
    *,
    pgp_sym_decrypt (
        decode(encrypted_api_key, 'hex'),
        (
            SELECT
                decrypted_secret
            FROM
                vault.decrypted_secrets
            WHERE
                id = encryption_key_id
        )
    ) AS decrypted_api_key
FROM
    public.workspace;

-- Trigger to populate the encryption_key_id column prior to insert
CREATE TRIGGER initialize_workspace_trigger BEFORE INSERT ON public.workspace FOR EACH ROW
EXECUTE FUNCTION public.initialize_workspace ();

-- Create a trigger to create a default workspace when a user is inserted in auth.users
CREATE TRIGGER create_default_workspace_trigger
AFTER INSERT ON auth.users FOR EACH ROW
EXECUTE FUNCTION public.create_default_workspace ();
