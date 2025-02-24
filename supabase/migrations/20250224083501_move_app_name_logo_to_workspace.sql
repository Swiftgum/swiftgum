-- Add new columns to workspace table
ALTER TABLE public.workspace
ADD COLUMN app_name TEXT,
ADD COLUMN app_icon TEXT;

-- Add constraint to validate base64 encoded image and size limit (10MB)
ALTER TABLE public.workspace
ADD CONSTRAINT valid_app_icon CHECK (
  app_icon IS NULL
  OR (
    app_icon ~ '^data:image\/(jpeg|png|svg\+xml);base64,[A-Za-z0-9+/=]+$'
    AND length(
      decode(
        substring(
          app_icon
          from
            ';base64,(.*)$'
        ),
        'base64'
      )
    ) <= 10485760
  )
);

-- Migrate existing app names from portal sessions to workspace
WITH
  latest_portal_sessions AS (
    SELECT DISTINCT
      ON (workspace_id) workspace_id,
      configuration ->> 'appName' as app_name
    FROM
      private.portal_sessions
    WHERE
      configuration ->> 'appName' IS NOT NULL
    ORDER BY
      workspace_id,
      created_at DESC
  )
UPDATE public.workspace w
SET
  app_name = lps.app_name
FROM
  latest_portal_sessions lps
WHERE
  w.workspace_id = lps.workspace_id;

-- Add a comment explaining the app_icon format
COMMENT ON COLUMN public.workspace.app_icon IS 'Base64 encoded image with format data:image/<type>;base64,<data>. Supports JPEG, PNG, and SVG. Maximum size 10MB.';
