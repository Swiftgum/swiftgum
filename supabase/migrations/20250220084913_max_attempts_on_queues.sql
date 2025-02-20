-- Add triggers to archive messages after max attempts
CREATE OR REPLACE FUNCTION pgmq.archive_on_max_attempts () RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read_ct >= TG_ARGV[1]::int THEN
        PERFORM pgmq.archive(
            queue_name => TG_ARGV[0],
            msg_id => NEW.msg_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each queue
CREATE TRIGGER archive_internal_queue_max_attempts
AFTER
UPDATE ON pgmq.q_internal_queue FOR EACH ROW
EXECUTE FUNCTION pgmq.archive_on_max_attempts ('internal_queue', 3);

CREATE TRIGGER archive_export_queue_max_attempts
AFTER
UPDATE ON pgmq.q_export_queue FOR EACH ROW
EXECUTE FUNCTION pgmq.archive_on_max_attempts ('export_queue', 3);

CREATE TRIGGER archive_indexing_queue_max_attempts
AFTER
UPDATE ON pgmq.q_indexing_queue FOR EACH ROW
EXECUTE FUNCTION pgmq.archive_on_max_attempts ('indexing_queue', 3);

CREATE TRIGGER archive_parsing_queue_max_attempts
AFTER
UPDATE ON pgmq.q_parsing_queue FOR EACH ROW
EXECUTE FUNCTION pgmq.archive_on_max_attempts ('parsing_queue', 3);
