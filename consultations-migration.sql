-- Consultations Table Migration - Add Missing Columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to existing consultations table
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

-- Drop old columns if they exist (optional - only if you want to remove old structure)
-- ALTER TABLE consultations 
-- DROP COLUMN IF EXISTS client_id,
-- DROP COLUMN IF EXISTS date,
-- DROP COLUMN IF EXISTS medium,
-- DROP COLUMN IF EXISTS stones_discussed,
-- DROP COLUMN IF EXISTS outcome,
-- DROP COLUMN IF EXISTS follow_up_needed,
-- DROP COLUMN IF EXISTS next_follow_up_date,
-- DROP COLUMN IF EXISTS notes;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_client_name ON consultations(client_name);
CREATE INDEX IF NOT EXISTS idx_consultations_consultation_date ON consultations(consultation_date);
CREATE INDEX IF NOT EXISTS idx_consultations_consultation_status ON consultations(consultation_status);

-- Enable Row Level Security
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create RLS policy (allow all operations for now)
CREATE POLICY "Allow all operations on consultations" ON consultations FOR ALL USING (true);
