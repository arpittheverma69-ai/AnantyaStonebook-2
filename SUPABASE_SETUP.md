# Supabase Setup Instructions

## Database Migration

Run the following SQL in your Supabase SQL Editor to add all the missing columns:

```sql
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
```

## Steps to Run Migration:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the SQL above
4. Click "Run" to execute the migration
5. Verify the columns are added by checking the Table Editor

## Environment Variables

Make sure you have these environment variables set in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## API Routes

The backend provides these API routes:

- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `PATCH /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

## Troubleshooting

If you get "column not found" errors, make sure to run the migration SQL above in your Supabase database.

### Debug Steps:

1. **Check Console Logs** - Look for the detailed debug logs when updating suppliers
2. **Verify Database Columns** - Make sure all columns exist in the suppliers table
3. **Check Data Mapping** - Ensure the mapping functions handle all fields correctly
4. **Test Form Submission** - Use the "Test Submit" button to see form data 