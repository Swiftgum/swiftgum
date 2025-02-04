-- Function to push message to the indexing_queue using pgmq
CREATE OR REPLACE FUNCTION queue_indexing_task (task jsonb) RETURNS bigint -- Changed from void to bigint to return msg_id
LANGUAGE plpgsql SECURITY DEFINER
SET
  search_path = '' AS $$
DECLARE
    msg_id bigint;
BEGIN
    SELECT msg_id INTO msg_id FROM pgmq.send(
      queue_name => 'indexing_queue',
      msg => task
    );
    RETURN msg_id;
END;
$$;
