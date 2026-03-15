-- Fix get_estimated_wait_time function
-- The issue is ORDER BY updated_at in an aggregate query without proper grouping

DROP FUNCTION IF EXISTS get_estimated_wait_time(UUID);

CREATE OR REPLACE FUNCTION get_estimated_wait_time(
    p_queue_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    avg_consultation_time INTEGER;
    patients_ahead INTEGER;
    estimated_time INTEGER;
BEGIN
    -- Get average consultation time from last 10 completed consultations
    SELECT COALESCE(AVG(actual_wait_time), 15) INTO avg_consultation_time
    FROM (
        SELECT actual_wait_time
        FROM queue
        WHERE status = 'completed'
        AND actual_wait_time IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 10
    ) recent_consultations;
    
    -- Count patients ahead in queue
    SELECT COUNT(*) INTO patients_ahead
    FROM queue q1
    JOIN queue q2 ON q2.id = p_queue_id
    WHERE q1.status = 'waiting'
    AND q1.queue_number < q2.queue_number;
    
    -- Calculate estimated time
    estimated_time := patients_ahead * avg_consultation_time;
    
    RETURN estimated_time;
END;
$$ LANGUAGE plpgsql;
