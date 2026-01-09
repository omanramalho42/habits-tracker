-- Create habit schedules table to track when habits should occur
CREATE TABLE IF NOT EXISTS habit_schedules (
  id SERIAL PRIMARY KEY,
  habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(habit_id, scheduled_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_habit_schedules_habit_date ON habit_schedules(habit_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_habit_schedules_date ON habit_schedules(scheduled_date);

-- Add helpful comment
COMMENT ON TABLE habit_schedules IS 'Tracks scheduled occurrences of habits and their completion status';
