-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id SERIAL PRIMARY KEY,
  mood_type VARCHAR(50) NOT NULL,
  mood_level VARCHAR(50) NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entry_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mood_entries_date ON mood_entries(entry_date);

COMMENT ON COLUMN mood_entries.mood_type IS 'Initial mood selection: joyful, cheerful, content, etc.';
COMMENT ON COLUMN mood_entries.mood_level IS 'Detailed mood: heartbroken, despairing, devastated, etc.';
