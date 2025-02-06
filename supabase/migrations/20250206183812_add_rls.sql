ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable users to view their own integrations"
ON public.integrations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = integrations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);

CREATE POLICY "Enable users to insert integrations in their own workspaces"
ON public.integrations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = integrations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);


CREATE POLICY "Enable users to update their own integrations"
ON public.integrations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = integrations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = integrations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);

-- Enable RLS on the destinations table
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view their own destinations
CREATE POLICY "Enable users to view their own destinations"
ON public.destinations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = destinations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);

-- Policy: Allow users to insert destinations in their own workspaces
CREATE POLICY "Enable users to insert destinations in their own workspaces"
ON public.destinations
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = destinations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);

-- Policy: Allow users to update their own destinations
CREATE POLICY "Enable users to update their own destinations"
ON public.destinations
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = destinations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.workspace 
    WHERE workspace.workspace_id = destinations.workspace_id 
      AND workspace.owner_user_id = auth.uid()
  )
);

-- -- Enable RLS on the workspace table
-- ALTER TABLE public.workspace ENABLE ROW LEVEL SECURITY;

-- -- Allow workspace owners to view their workspace
-- CREATE POLICY "Enable owners to view their own workspace"
-- ON public.workspace
-- AS PERMISSIVE
-- FOR SELECT
-- TO authenticated
-- USING (
--   workspace.owner_user_id = auth.uid()
-- );

-- -- Allow end users to view their workspace
-- CREATE POLICY "Enable end users to view workspaces they belong to"
-- ON public.workspace
-- AS PERMISSIVE
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM public.end_users 
--     WHERE end_users.workspace_id = workspace.workspace_id 
--     AND end_users.end_user_id = auth.uid()
--   )
-- );
