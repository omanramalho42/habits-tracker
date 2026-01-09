-- Add user_id column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NOT NULL DEFAULT 'system';

-- Add user_id column to mood_entries table
ALTER TABLE mood_entries ADD COLUMN IF NOT EXISTS user_id VARCHAR(255) NOT NULL DEFAULT 'system';

-- Create indexes for user_id
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_habits_user_date ON habits(user_id, start_date);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, entry_date);
