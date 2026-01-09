-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  goal VARCHAR(255) NOT NULL,
  motivation VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reminder BOOLEAN DEFAULT false,
  frequency JSONB NOT NULL DEFAULT '["M","T","W","T","F","S","S"]',
  color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create habit_completions table
CREATE TABLE IF NOT EXISTS habit_completions (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, completed_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completed_date);
