-- Force fix consultations table - Drop and recreate completely
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'consultations'
ORDER BY ordinal_position;

-- Drop the entire table and recreate it
DROP TABLE IF EXISTS consultations CASCADE;

-- Create the consultations table with the correct schema
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  consultation_type TEXT NOT NULL DEFAULT 'Initial',
  consultation_date TIMESTAMP NOT NULL DEFAULT NOW(),
  consultation_time TEXT NOT NULL DEFAULT '09:00',
  duration TEXT NOT NULL DEFAULT '30 min',
  gemstone_interest TEXT[] DEFAULT '{}',
  budget TEXT NOT NULL DEFAULT '₹10,000 - ₹50,000',
  urgency TEXT NOT NULL DEFAULT 'Medium',
  consultation_status TEXT NOT NULL DEFAULT 'Scheduled',
  consultation_notes TEXT NOT NULL DEFAULT '',
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP,
  follow_up_notes TEXT,
  recommendations TEXT NOT NULL DEFAULT '',
  next_steps TEXT NOT NULL DEFAULT '',
  client_satisfaction INTEGER,
  special_requirements TEXT,
  location TEXT NOT NULL DEFAULT '',
  consultation_method TEXT NOT NULL DEFAULT 'In-Person',
  payment_status TEXT NOT NULL DEFAULT 'Pending',
  consultation_fee TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_consultations_client_name ON consultations(client_name);
CREATE INDEX idx_consultations_consultation_date ON consultations(consultation_date);
CREATE INDEX idx_consultations_consultation_status ON consultations(consultation_status);

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all operations for now)
CREATE POLICY "Allow all operations on consultations" ON consultations FOR ALL USING (true);

-- Verify the final table structure
SELECT column_name, data_type, is_nullable, column_default
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

-- Show final result
SELECT 'Table created successfully!' as status;
