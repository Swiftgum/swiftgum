-- Create a table called end_users
CREATE TABLE end_users (
  end_user_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  foreign_id TEXT NOT NULL,
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- (foreign_id, workspace_id) must be unique
ALTER TABLE end_users
ADD CONSTRAINT uq_end_users_foreign_id_workspace_id UNIQUE (foreign_id, workspace_id);

-- Add a foreign key constraint to the end_users table
ALTER TABLE end_users
ADD CONSTRAINT fk_end_users_workspace_id FOREIGN KEY (workspace_id) REFERENCES workspace (workspace_id);

-- Create a table called auth_sessions
CREATE TABLE auth_sessions (
  auth_session_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  end_user_id UUID NOT NULL,
  integration_id UUID NOT NULL,
  auth_session JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Add relation between end_users and oauth_sessions
ALTER TABLE auth_sessions
ADD CONSTRAINT fk_auth_sessions_end_user_id FOREIGN KEY (end_user_id) REFERENCES end_users (end_user_id);

-- Add relation between auth_sessions and integrations
ALTER TABLE auth_sessions
ADD CONSTRAINT fk_auth_sessions_integration_id FOREIGN KEY (integration_id) REFERENCES integrations (integration_id);

-- Create view that only shows auth_sessions that have not been claimed and are less than 10 minutes old
CREATE VIEW valid_auth_sessions AS
SELECT
  *
FROM
  auth_sessions
WHERE
  claimed_at IS NULL
  AND created_at > NOW() - INTERVAL '10 minutes';
