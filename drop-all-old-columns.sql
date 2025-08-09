-- Drop ALL old columns from consultations table
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'consultations'
ORDER BY ordinal_position;

-- Drop ALL old columns that are causing issues
ALTER TABLE consultations 
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS date,
DROP COLUMN IF EXISTS medium,
DROP COLUMN IF EXISTS stones_discussed,
DROP COLUMN IF EXISTS outcome,
DROP COLUMN IF EXISTS follow_up_needed,
DROP COLUMN IF EXISTS next_follow_up_date,
DROP COLUMN IF EXISTS notes;

-- Now add ALL the new required columns
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS client_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_phone TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_email TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS consultation_type TEXT NOT NULL DEFAULT 'Initial',
ADD COLUMN IF NOT EXISTS consultation_date TIMESTAMP NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS consultation_time TEXT NOT NULL DEFAULT '09:00',
ADD COLUMN IF NOT EXISTS duration TEXT NOT NULL DEFAULT '30 min',
ADD COLUMN IF NOT EXISTS gemstone_interest TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget TEXT NOT NULL DEFAULT '₹10,000 - ₹50,000',
ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS consultation_status TEXT NOT NULL DEFAULT 'Scheduled',
ADD COLUMN IF NOT EXISTS consultation_notes TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS recommendations TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS next_steps TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS client_satisfaction INTEGER,
ADD COLUMN IF NOT EXISTS special_requirements TEXT,
ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS consultation_method TEXT NOT NULL DEFAULT 'In-Person',
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS consultation_fee TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Check final structure to confirm all old columns are gone
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'consultations'
ORDER BY ordinal_position;

-- Test insert to make sure it works
INSERT INTO consultations (
  client_name,
  client_phone,
  client_email,
  consultation_type,
  consultation_date,
  consultation_time,
  duration,
  gemstone_interest,
  budget,
  urgency,
  consultation_status,
  consultation_notes,
  follow_up_required,
  recommendations,
  next_steps,
  location,
  consultation_method,
  payment_status
) VALUES (
  'Test Client',
  '+91 9876543210',
  'test@example.com',
  'Initial',
  NOW(),
  '10:00',
  '30 min',
  ARRAY['Ruby', 'Sapphire'],
  '₹50,000 - ₹1,00,000',
  'Medium',
  'Scheduled',
  'Test consultation',
  false,
  'Test recommendations',
  'Test next steps',
  'Mumbai, Maharashtra',
  'In-Person',
  'Pending'
);

-- Clean up test data
DELETE FROM consultations WHERE client_name = 'Test Client';

-- Show success message
SELECT 'All old columns dropped and new columns added successfully!' as status;
