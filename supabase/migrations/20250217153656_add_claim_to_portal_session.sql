-- Make the cookie_hash column nullable
ALTER TABLE private.portal_sessions
ALTER COLUMN cookie_hash
DROP NOT NULL;

-- Create derived claimed column based on cookie_hash is null or not (==> virtual column)
ALTER TABLE private.portal_sessions
ADD COLUMN claimed BOOLEAN GENERATED ALWAYS AS (cookie_hash IS NOT NULL) STORED;

-- Drop existing valid view if it exists
DROP VIEW IF EXISTS private.valid_portal_sessions;

-- Recreate valid view to only show claimed sessions
CREATE VIEW private.valid_portal_sessions AS
SELECT
  *
FROM
  private.portal_sessions
WHERE
  claimed = true
  AND expires_at > now();

-- Create new view for unclaimed portal sessions
CREATE VIEW private.unclaimed_portal_sessions AS
SELECT
  *
FROM
  private.portal_sessions
WHERE
  claimed = false
  AND expires_at > now();

-- Revoke all permissions from all roles for each view
REVOKE ALL ON private.destinations_with_decrypted_params
FROM
  PUBLIC;

REVOKE ALL ON private.integrations_with_decrypted_credentials
FROM
  PUBLIC;

REVOKE ALL ON private.tokens_with_decrypted_tokenset
FROM
  PUBLIC;

REVOKE ALL ON private.unclaimed_portal_sessions
FROM
  PUBLIC;

REVOKE ALL ON private.valid_auth_sessions
FROM
  PUBLIC;

REVOKE ALL ON private.valid_portal_sessions
FROM
  PUBLIC;

REVOKE ALL ON private.workspace_with_decrypted_api_key
FROM
  PUBLIC;

-- Grant permissions only to service_role and postgres for each view
GRANT ALL ON private.destinations_with_decrypted_params TO service_role,
postgres;

GRANT ALL ON private.integrations_with_decrypted_credentials TO service_role,
postgres;

GRANT ALL ON private.tokens_with_decrypted_tokenset TO service_role,
postgres;

GRANT ALL ON private.unclaimed_portal_sessions TO service_role,
postgres;

GRANT ALL ON private.valid_auth_sessions TO service_role,
postgres;

GRANT ALL ON private.valid_portal_sessions TO service_role,
postgres;

GRANT ALL ON private.workspace_with_decrypted_api_key TO service_role,
postgres;
