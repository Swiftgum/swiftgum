-- Add a function to retrieve a Workspace by its API key
CREATE FUNCTION private.get_workspace_by_api_key (p_api_key TEXT) RETURNS public.workspace LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    workspace public.workspace;
BEGIN
    SELECT * INTO workspace FROM public.workspace WHERE hashed_api_key = extensions.crypt(p_api_key, hashed_api_key);
    RETURN workspace;
END;
$$;
