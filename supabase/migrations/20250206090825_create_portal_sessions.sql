CREATE TABLE portal_sessions (
  portal_session_id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  workspace_id UUID NOT NULL REFERENCES workspace (workspace_id),
  end_user_id UUID NOT NULL REFERENCES end_users (end_user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
  configuration JSONB NOT NULL,
  cookie_hash TEXT NOT NULL
);

CREATE VIEW valid_portal_sessions AS
SELECT
  *
FROM
  portal_sessions
WHERE
  expires_at > NOW();

-- Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_portal_sessions () RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
BEGIN
    DELETE FROM public.portal_sessions
    WHERE portal_session_id NOT IN (
        SELECT portal_session_id FROM public.valid_portal_sessions
    )
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$;

-- Schedule the cron job to run every hour
SELECT
  cron.schedule (
    'cleanup-expired-portal-sessions', -- job name
    '0 * * * *', -- every hour (cron expression)
    'SELECT public.cleanup_expired_portal_sessions()'
  );
