-- Function to sign portal session
CREATE FUNCTION private.sign_portal_session (p_portal_session_id UUID, p_workspace_id UUID) RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    encryption_key text;
    session_data private.unclaimed_portal_sessions;
    payload text;
    signature text;
BEGIN
    -- 1. Check session exists and matches workspace
    SELECT *
    INTO session_data
    FROM private.unclaimed_portal_sessions
    WHERE portal_session_id = p_portal_session_id
    AND workspace_id = p_workspace_id;

    IF session_data IS NULL THEN
        RAISE EXCEPTION 'Invalid or claimed portal session';
    END IF;

    -- 2. Get the workspace encryption key
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Workspace encryption key not found';
    END IF;

    -- 3. Create payload with relevant session data and encode to hex
    payload := encode(
        convert_to(
            json_build_object(
                'sid', session_data.portal_session_id,
                'wid', session_data.workspace_id,
                'uid', session_data.end_user_id,
                'iat', extract(epoch from session_data.created_at)
            )::text,
            'UTF8'
        ),
        'hex'
    );

    -- Generate HMAC signature using workspace encryption key and configuration
    signature := encode(
        extensions.hmac(
            (payload || session_data.configuration)::bytea,
            encryption_key::bytea,
            'sha256'
        ),
        'hex'
    );

    -- Return payload and signature combined
    RETURN payload || '.' || signature;
END;
$$;

-- First create the type
CREATE TYPE private.portal_session_claim AS (cookie_nonce text, expires_at timestamptz);

-- Function to verify and claim portal session signature
CREATE FUNCTION private.claim_portal_session (p_signed_payload text, p_portal_session_id UUID) RETURNS private.portal_session_claim LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    parts text[];
    payload text;
    provided_signature text;
    payload_data json;
    p_workspace_id UUID;
    encryption_key text;
    expected_signature text;
    session_data private.portal_sessions;
    cookie_nonce text;
BEGIN
    -- Split the signed payload
    parts := string_to_array(p_signed_payload, '.');

    IF array_length(parts, 1) != 2 THEN
        RAISE EXCEPTION 'Invalid signed payload format';
    END IF;

    payload := parts[1];
    provided_signature := parts[2];

    -- Parse the payload
    payload_data := convert_from(decode(payload, 'hex'), 'UTF8')::json;

    -- Verify session ID matches
    IF (payload_data->>'sid')::UUID != p_portal_session_id THEN
        RAISE EXCEPTION 'Session ID mismatch';
    END IF;

    -- Get workspace ID from payload
    p_workspace_id := (payload_data->>'wid')::UUID;

    -- Get encryption key for workspace
    SELECT decrypted_secret
    INTO encryption_key
    FROM vault.decrypted_secrets ds
    JOIN public.workspace w ON w.encryption_key_id = ds.id
    WHERE w.workspace_id = p_workspace_id;

    IF encryption_key IS NULL THEN
        RAISE EXCEPTION 'Workspace encryption key not found';
    END IF;

    -- Generate a new cookie nonce (using gen_random_uuid for cryptographic randomness)
    cookie_nonce := gen_random_uuid()::text;

    -- Get session data and verify it's still unclaimed, while atomically updating cookie_hash
    WITH updated_session AS (
        UPDATE private.portal_sessions ps
        SET cookie_hash = encode(
            extensions.hmac(
                cookie_nonce::bytea,
                encryption_key::bytea,
                'sha256'
            ),
            'hex'
        )
        WHERE ps.portal_session_id = p_portal_session_id
        AND cookie_hash IS NULL
        AND EXISTS (
            SELECT 1
            FROM private.unclaimed_portal_sessions ups
            WHERE ups.portal_session_id = ps.portal_session_id
            AND ups.workspace_id = p_workspace_id
        )
        RETURNING *
    )
    SELECT *
    INTO session_data
    FROM updated_session;

    IF session_data IS NULL THEN
        RAISE EXCEPTION 'Invalid or claimed portal session';
    END IF;

    -- Verify signature
    expected_signature := encode(
        extensions.hmac(
            (payload || session_data.configuration)::bytea,
            encryption_key::bytea,
            'sha256'
        ),
        'hex'
    );

    IF provided_signature != expected_signature THEN
        RAISE EXCEPTION 'Invalid signature';
    END IF;

    -- Return a single record with both values
    RETURN ROW(cookie_nonce, session_data.expires_at)::private.portal_session_claim;
END;
$$;

-- Function to retrieve a valid portal session (from portal_session_id and cookie_nonce, selecting from the private.valid_portal_sessions view)
CREATE FUNCTION private.get_portal_session (p_portal_session_id UUID, p_cookie_nonce text) RETURNS private.portal_sessions LANGUAGE plpgsql SECURITY DEFINER
SET
    search_path = '' AS $$
DECLARE
    session_data private.portal_sessions;
    encryption_key text;
BEGIN
    -- Get session data
    SELECT ps.*
    INTO session_data
    FROM private.valid_portal_sessions ps
    WHERE ps.portal_session_id = p_portal_session_id;

    -- Check if session exists
    IF session_data IS NULL THEN
        RAISE EXCEPTION 'Portal session not found';
    END IF;

    -- Get encryption key
    SELECT ds.decrypted_secret
    INTO encryption_key
    FROM public.workspace w
    JOIN vault.decrypted_secrets ds ON ds.id = w.encryption_key_id
    WHERE w.workspace_id = session_data.workspace_id;

    -- Verify cookie hash
    IF session_data.cookie_hash != encode(
        extensions.hmac(
            p_cookie_nonce::bytea,
            encryption_key::bytea,
            'sha256'
        ),
        'hex'
    ) THEN
        RAISE EXCEPTION 'Invalid cookie';
    END IF;

    RETURN session_data;
END;
$$;
