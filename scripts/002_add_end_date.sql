-- Add end_date column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comment explaining the column
COMMENT ON COLUMN habits.end_date IS 'Optional end date for the habit. NULL means never ends.';
