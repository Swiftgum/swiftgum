-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create the logs table
CREATE TABLE public.logs (
  log_id UUID NOT NULL DEFAULT gen_random_uuid (),
  private BOOLEAN NOT NULL DEFAULT true,
  workspace_id UUID,
  user_id UUID,
  timestamp TIMESTAMPTZ NOT NULL,
  ingestion_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_user_id UUID,
  level TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  id TEXT,
  metadata JSONB,
  CONSTRAINT valid_log_level CHECK (
    level IN (
      'verbose',
      'info',
      'security',
      'warning',
      'error',
      'debug'
    )
  ),
  CONSTRAINT logs_pkey PRIMARY KEY (log_id, timestamp),
  FOREIGN KEY (workspace_id) REFERENCES public.workspace (workspace_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
  FOREIGN KEY (end_user_id) REFERENCES public.end_users (end_user_id) ON DELETE SET NULL
);

-- Create trigger function to prevent ingestion_time modifications
CREATE OR REPLACE FUNCTION private.protect_ingestion_time () RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.ingestion_time != OLD.ingestion_time THEN
            RAISE EXCEPTION 'ingestion_time cannot be modified';
        END IF;
    ELSIF TG_OP = 'INSERT' THEN
        -- On INSERT, ignore any provided ingestion_time and force it to NOW()
        NEW.ingestion_time := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER protect_ingestion_time BEFORE INSERT
OR
UPDATE ON public.logs FOR EACH ROW
EXECUTE FUNCTION private.protect_ingestion_time ();

-- Enable RLS
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for workspace isolation
CREATE POLICY logs_access ON public.logs FOR
SELECT
  USING (
    NOT private
    AND (
      -- Allow access to non-private logs if user has workspace access
      workspace_id IN (
        SELECT
          workspace_id
        FROM
          public.workspace
        WHERE
          owner_user_id = (
            SELECT
              auth.uid ()
          )
      )
      OR
      -- Allow access to logs where the user is the creator
      user_id = (
        SELECT
          auth.uid ()
      )
    )
  );

-- Create hypertable with time partitioning
-- Using 1 day chunks since logs are typically high volume
-- Following CloudWatch pattern:
-- - We partition on timestamp for better query performance on the most common access pattern
-- - Most queries will be based on when events occurred, not when we received them
SELECT
  create_hypertable (
    'logs',
    'timestamp',
    chunk_time_interval => INTERVAL '1 day',
    create_default_indexes => FALSE
  );

-- Create optimized indexes
-- Primary compound index prioritizes timestamp for common query patterns
-- Secondary index on ingestion_time for operational queries
CREATE INDEX ON logs (workspace_id, timestamp DESC);

CREATE INDEX ON logs (end_user_id)
WHERE
  end_user_id IS NOT NULL;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX logs_task_id_trgm_idx ON public.logs USING gin (id gin_trgm_ops);

-- Create the cleanup function in private schema
CREATE OR REPLACE FUNCTION private.cleanup_old_logs () RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
BEGIN
    -- Drop chunks older than 90 days based on event timestamp
    -- This matches CloudWatch's retention behavior
    PERFORM public.drop_chunks('public.logs', INTERVAL '90 days');

    -- Log the operation
    RAISE NOTICE 'Cleaned up logs older than 90 days using drop_chunks';
END;
$$;

-- Schedule the cron job to run daily at midnight
SELECT
  cron.schedule (
    'cleanup-old-logs', -- job name
    '0 0 * * *', -- daily at midnight (cron expression)
    'SELECT private.cleanup_old_logs()'
  );

-- Add a maximum size for the JSONB metadata
ALTER TABLE public.logs
ADD CONSTRAINT metadata_size_check CHECK (octet_length(metadata::text) <= 16384);
