-- Generate a basic user with uuid in auth.users (supabase default)
INSERT INTO
  auth.users (
    id,
    raw_user_meta_data,
    email,
    email_confirmed_at,
    created_at,
    updated_at
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '{"display_name": "Test User"}',
    'test@test.com',
    now(),
    now(),
    now()
  );

-- Generate a basic workspace with uuid in public.workspace
INSERT INTO
  public.workspace (
    workspace_id,
    owner_user_id,
    label,
    created_at,
    updated_at
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'Test Workspace',
    now(),
    now()
  );

-- Set the API key for the workspace
SELECT
  public.update_api_key (
    '00000000-0000-0000-0000-000000000000',
    'test-api-key'
  );

-- Create a provider for Google and Notion
INSERT INTO
  public.providers (identifier, name, description)
VALUES
  (
    'google:drive',
    'Google Drive',
    'Google Drive is a file storage and sharing service'
  );

-- Create a provider for Notion
INSERT INTO
  public.providers (identifier, name, description)
VALUES
  (
    'notion:notion',
    'Notion Database',
    'Notion Database is a database service'
  );
