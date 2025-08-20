-- Add missing columns to sales table for enhanced functionality
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS waiting_period INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_trustworthy BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS any_discount DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_out_of_state BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cgst DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS igst DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_with_tax DECIMAL(15,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN sales.waiting_period IS 'Waiting period in days for unpaid sales';
COMMENT ON COLUMN sales.is_trustworthy IS 'Whether the client is trustworthy';
COMMENT ON COLUMN sales.any_discount IS 'Discount amount applied to the sale';
COMMENT ON COLUMN sales.is_out_of_state IS 'Whether the sale is out of state (affects GST)';
COMMENT ON COLUMN sales.cgst IS 'Central GST amount';
COMMENT ON COLUMN sales.sgst IS 'State GST amount';
COMMENT ON COLUMN sales.igst IS 'Integrated GST amount';
COMMENT ON COLUMN sales.total_with_tax IS 'Total amount including all taxes';
