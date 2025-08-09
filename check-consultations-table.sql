-- Check if consultations table exists and has the right columns
-- Run this in your Supabase SQL Editor

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'consultations'
) as table_exists;

-- Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'consultations'
ORDER BY ordinal_position;

-- Check if we can insert a test record
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
