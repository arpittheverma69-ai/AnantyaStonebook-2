-- Anantya Stonebook CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enhanced Gemstone Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gem_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  grade TEXT NOT NULL DEFAULT 'A',
  carat DECIMAL(10,2) NOT NULL,
  origin TEXT NOT NULL,
  custom_origin TEXT,
  price_per_carat DECIMAL(15,2) NOT NULL,
  total_price DECIMAL(15,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  quantity INTEGER DEFAULT 1,
  image_url TEXT,
  description TEXT,
  ai_analysis TEXT,
  supplier_id UUID REFERENCES suppliers(id),
  certified BOOLEAN DEFAULT false,
  certificate_lab TEXT,
  certificate_file TEXT,
  status TEXT NOT NULL DEFAULT 'In Stock',
  package_type TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  client_type TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  gst_number TEXT,
  business_name TEXT,
  business_address TEXT,
  loyalty_level TEXT DEFAULT 'Medium',
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  type TEXT NOT NULL,
  gemstone_types TEXT[] DEFAULT '{}',
  certification_options TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add enhanced supplier tracking columns
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS arrival_date TIMESTAMP;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS departure_date TIMESTAMP;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS total_sold NUMERIC;

-- Add missing columns to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS arrival_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS departure_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS landmark TEXT,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS total_sold DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS quality_rating INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_transaction_date TIMESTAMP;

-- Add missing columns to clients table (if not already added)
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS is_trustworthy BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS what_they_want TEXT[] DEFAULT '{}';

-- Add missing columns to inventory table (if not already added)
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis TEXT;

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id TEXT NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  client_id UUID REFERENCES clients(id),
  stone_id UUID REFERENCES inventory(id),
  quantity INTEGER DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL,
  profit DECIMAL(15,2) NOT NULL,
  invoice_file TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Unpaid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certification Tracker Table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stone_id UUID REFERENCES inventory(id),
  lab TEXT NOT NULL,
  date_sent TIMESTAMP WITH TIME ZONE,
  date_received TIMESTAMP WITH TIME ZONE,
  certificate_file TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  medium TEXT NOT NULL,
  outcome TEXT NOT NULL,
  notes TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to consultations table
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

-- Drop old columns if they exist
ALTER TABLE consultations 
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS date,
DROP COLUMN IF EXISTS medium,
DROP COLUMN IF EXISTS stones_discussed,
DROP COLUMN IF EXISTS outcome,
DROP COLUMN IF EXISTS follow_up_needed,
DROP COLUMN IF EXISTS next_follow_up_date,
DROP COLUMN IF EXISTS notes;

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  priority TEXT NOT NULL DEFAULT 'Medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  related_to TEXT,
  related_to_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_gem_id ON inventory(gem_id);
CREATE INDEX IF NOT EXISTS idx_inventory_type ON inventory(type);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_city ON clients(city);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_payment_status ON sales(payment_status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Enable Row Level Security (RLS)
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on suppliers" ON suppliers FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on certifications" ON certifications FOR ALL USING (true);
CREATE POLICY "Allow all operations on consultations" ON consultations FOR ALL USING (true);
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('anantya-files', 'anantya-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public access to anantya-files" ON storage.objects
FOR SELECT USING (bucket_id = 'anantya-files');

CREATE POLICY "Allow authenticated uploads to anantya-files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'anantya-files');

CREATE POLICY "Allow authenticated updates to anantya-files" ON storage.objects
FOR UPDATE USING (bucket_id = 'anantya-files');

CREATE POLICY "Allow authenticated deletes from anantya-files" ON storage.objects
FOR DELETE USING (bucket_id = 'anantya-files'); 