-- Create the rotate API key function in private schema
CREATE FUNCTION private.rotate_api_key (p_workspace_id UUID) RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    new_api_key text;
BEGIN
    -- Generate a new API key using the same method as in initialize_workspace
    new_api_key := encode(extensions.gen_random_bytes(64), 'hex');

    -- Update the workspace with the new API key
    PERFORM private.update_api_key(p_workspace_id, new_api_key);

    -- Return the new API key (it will be encrypted in the database but we return it once)
    RETURN new_api_key;
END;
$$;
