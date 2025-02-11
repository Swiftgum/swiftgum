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
  public.providers (provider_id, identifier, name, description)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
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
    'Notion',
    'Notion is a productivity platform'
  );

INSERT INTO
  public.integrations (
    integration_id,
    provider_id,
    workspace_id,
    enabled,
    encrypted_credentials
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000', -- integration_id
    '00000000-0000-0000-0000-000000000000', -- provider_id (google:drive)
    '00000000-0000-0000-0000-000000000000', -- workspace_id
    TRUE,
    public.encrypt_integration_credentials (
      '00000000-0000-0000-0000-000000000000',
      '{"type": "oauth2", "oauth2": {"url": "https://accounts.google.com/.well-known/openid-configuration", "client_id": "565952417713-b6nksc77t71tho5fqeodc8b2djvfskr2.apps.googleusercontent.com", "client_secret": "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"}}'
    )
  );

-- Insert an end user
INSERT INTO
  public.end_users (end_user_id, foreign_id, workspace_id)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'test@test.com',
    '00000000-0000-0000-0000-000000000000'
  );

INSERT INTO
  public.destinations (
    destination_id,
    workspace_id,
    encrypted_destination_params
  )
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    public.encrypt_destination_params (
      '00000000-0000-0000-0000-000000000000',
      '{"type": "webhook", "webhook": {"url": "https://webhook.site/4b199f9c-7f0b-44bd-ab26-3c75dd4bd52f"}}'
    )
  );
