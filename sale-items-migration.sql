-- Create sale_items table for multi-item sales support
CREATE TABLE IF NOT EXISTS sale_items (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id VARCHAR NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  stone_id VARCHAR NOT NULL REFERENCES inventory(id),
  quantity INTEGER DEFAULT 1,
  carat DECIMAL(10, 2) NOT NULL,
  price_per_carat DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_stone_id ON sale_items(stone_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (adjust as needed for your auth setup)
CREATE POLICY "Enable read access for all users" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON sale_items FOR DELETE USING (true);
