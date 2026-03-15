-- Add triage_complete notification type to the check constraint

-- Drop the old constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_notification_type_check;

-- Add the new constraint with triage_complete included
ALTER TABLE notifications ADD CONSTRAINT notifications_notification_type_check 
CHECK (notification_type IN (
    'payment_receipt', 
    'queue_update', 
    'prescription_ready', 
    'lab_result_ready',
    'doctor_assigned',
    'consultation_ready',
    'triage_complete'
));
