-- Add invoice-specific fields to sales table
-- Run this in your Supabase SQL editor

ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS buyers_order_number TEXT,
ADD COLUMN IF NOT EXISTS buyers_order_date TEXT,
ADD COLUMN IF NOT EXISTS dispatch_doc_no TEXT,
ADD COLUMN IF NOT EXISTS delivery_note_date TEXT,
ADD COLUMN IF NOT EXISTS dispatched_through TEXT,
ADD COLUMN IF NOT EXISTS destination TEXT,
ADD COLUMN IF NOT EXISTS terms_of_delivery TEXT;

-- Add comments for documentation
COMMENT ON COLUMN sales.buyers_order_number IS 'Buyer''s order number for invoice';
COMMENT ON COLUMN sales.buyers_order_date IS 'Buyer''s order date for invoice';
COMMENT ON COLUMN sales.dispatch_doc_no IS 'Dispatch document number for invoice';
COMMENT ON COLUMN sales.delivery_note_date IS 'Delivery note date for invoice';
COMMENT ON COLUMN sales.dispatched_through IS 'How goods are dispatched (Courier, Hand Delivery, etc.)';
COMMENT ON COLUMN sales.destination IS 'Delivery destination (Mumbai, Delhi, etc.)';
COMMENT ON COLUMN sales.terms_of_delivery IS 'Terms of delivery (As discussed, FOB, etc.)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'sales' 
AND column_name IN (
  'buyers_order_number', 
  'buyers_order_date', 
  'dispatch_doc_no', 
  'delivery_note_date', 
  'dispatched_through', 
  'destination', 
  'terms_of_delivery'
);
