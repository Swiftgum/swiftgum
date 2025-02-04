-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions () RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
BEGIN
    DELETE FROM public.auth_sessions
    WHERE auth_session_id NOT IN (
        SELECT auth_session_id FROM public.valid_auth_sessions
    );
END;
$$;

-- Schedule the cron job to run every minute
SELECT
  cron.schedule (
    'cleanup-expired-sessions', -- job name
    '0 * * * *', -- every minute (cron expression)
    'SELECT public.cleanup_expired_sessions()'
  );
