-- Add password_hash column to patients table for patient self-service
ALTER TABLE patients ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Make email unique for patient login
CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_email_unique ON patients(email) WHERE email IS NOT NULL;
