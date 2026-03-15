-- Migration: Enhanced Patient Payment Flow
-- Description: Add support for payment tracking, notifications, doctor assignments, and receipts
-- Date: 2024-03-15

-- ============================================
-- 1. ENHANCE PAYMENTS TABLE
-- ============================================

-- Add new columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_token VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS card_last4 VARCHAR(4);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_patient_date ON payments(patient_id, created_at);

-- ============================================
-- 2. ENHANCE TRIAGE RECORDS TABLE
-- ============================================

-- Add doctor assignment to triage records
ALTER TABLE triage_records ADD COLUMN IF NOT EXISTS assigned_doctor_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE triage_records ADD COLUMN IF NOT EXISTS assignment_notes TEXT;

-- Create index for doctor assignments
CREATE INDEX IF NOT EXISTS idx_triage_assigned_doctor ON triage_records(assigned_doctor_id);

-- ============================================
-- 3. CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN (
        'payment_receipt', 
        'queue_update', 
        'prescription_ready', 
        'lab_result_ready',
        'doctor_assigned',
        'consultation_ready'
    )),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    channels JSONB NOT NULL DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
    delivery_status JSONB DEFAULT '{"email": "pending", "sms": "pending", "push": "pending"}'::jsonb,
    metadata JSONB,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(patient_id, read_at);

-- Create trigger for notifications updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at 
BEFORE UPDATE ON notifications 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. CREATE PAYMENT RECEIPTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(100),
    clinic_name VARCHAR(200) NOT NULL DEFAULT 'Agmas Clinic',
    clinic_address TEXT DEFAULT 'Addis Ababa, Ethiopia',
    clinic_phone VARCHAR(20) DEFAULT '+251-911-234567',
    receipt_data JSONB,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for receipts
CREATE INDEX IF NOT EXISTS idx_receipts_payment_id ON payment_receipts(payment_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON payment_receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_receipts_generated_at ON payment_receipts(generated_at);

-- ============================================
-- 5. ENHANCE QUEUE TABLE
-- ============================================

-- Add payment and priority tracking to queue
ALTER TABLE queue ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;
ALTER TABLE queue ADD COLUMN IF NOT EXISTS priority_level VARCHAR(10) CHECK (priority_level IN ('green', 'yellow', 'orange', 'red'));
ALTER TABLE queue ADD COLUMN IF NOT EXISTS actual_wait_time INTEGER;

-- Create indexes for queue
CREATE INDEX IF NOT EXISTS idx_queue_priority ON queue(priority_level);
CREATE INDEX IF NOT EXISTS idx_queue_payment_id ON queue(payment_id);
CREATE INDEX IF NOT EXISTS idx_queue_doctor_status ON queue(doctor_id, status);

-- ============================================
-- 6. CREATE SEQUENCE FOR RECEIPT NUMBERS
-- ============================================

-- Create sequence for receipt numbers (RCP-YYYY-NNNN format)
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 1;

-- ============================================
-- 7. CREATE HELPER FUNCTIONS
-- ============================================

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    year_part VARCHAR(4);
    seq_part VARCHAR(4);
    receipt_num VARCHAR(50);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_part := LPAD(nextval('receipt_number_seq')::TEXT, 4, '0');
    receipt_num := 'RCP-' || year_part || '-' || seq_part;
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate queue position with priority
CREATE OR REPLACE FUNCTION calculate_queue_position(
    p_priority_level VARCHAR(10),
    p_created_at TIMESTAMP
)
RETURNS INTEGER AS $$
DECLARE
    position INTEGER;
    priority_weight INTEGER;
BEGIN
    -- Assign priority weights (lower is higher priority)
    CASE p_priority_level
        WHEN 'red' THEN priority_weight := 1;
        WHEN 'orange' THEN priority_weight := 2;
        WHEN 'yellow' THEN priority_weight := 3;
        WHEN 'green' THEN priority_weight := 4;
        ELSE priority_weight := 5;
    END CASE;
    
    -- Calculate position based on priority and time
    SELECT COUNT(*) + 1 INTO position
    FROM queue
    WHERE status = 'waiting'
    AND (
        (priority_level = 'red' AND priority_weight > 1)
        OR (priority_level = 'orange' AND priority_weight > 2)
        OR (priority_level = 'yellow' AND priority_weight > 3)
        OR (priority_level = 'green' AND priority_weight > 4)
        OR (priority_level = p_priority_level AND created_at < p_created_at)
    );
    
    RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Function to get estimated wait time
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
    FROM queue
    WHERE status = 'completed'
    AND actual_wait_time IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 10;
    
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

-- ============================================
-- 8. CREATE TRIGGERS
-- ============================================

-- Trigger to auto-generate receipt number
CREATE OR REPLACE FUNCTION auto_generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := generate_receipt_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_receipt_number ON payment_receipts;
CREATE TRIGGER trigger_generate_receipt_number
BEFORE INSERT ON payment_receipts
FOR EACH ROW
EXECUTE FUNCTION auto_generate_receipt_number();

-- Trigger to update queue estimated wait time
CREATE OR REPLACE FUNCTION update_queue_wait_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.estimated_wait_time := get_estimated_wait_time(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_queue_wait_time ON queue;
CREATE TRIGGER trigger_update_queue_wait_time
BEFORE INSERT OR UPDATE ON queue
FOR EACH ROW
WHEN (NEW.status = 'waiting')
EXECUTE FUNCTION update_queue_wait_time();

-- ============================================
-- 9. INSERT DEFAULT DATA
-- ============================================

-- Insert system notification for testing
INSERT INTO notifications (
    patient_id,
    notification_type,
    title,
    message,
    channels,
    metadata
)
SELECT 
    p.id,
    'queue_update',
    'Welcome to Agmas Clinic',
    'Your account has been created successfully. You can now join the queue and make payments.',
    '{"email": true, "sms": false, "push": false}'::jsonb,
    '{"system": true}'::jsonb
FROM patients p
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.patient_id = p.id
)
LIMIT 1;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Grant permissions on new tables (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO clinic_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON payment_receipts TO clinic_app_user;
-- GRANT USAGE ON SEQUENCE receipt_number_seq TO clinic_app_user;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify migration
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'New tables created: notifications, payment_receipts';
    RAISE NOTICE 'Enhanced tables: payments, triage_records, queue';
    RAISE NOTICE 'New functions: generate_receipt_number, calculate_queue_position, get_estimated_wait_time';
END $$;
