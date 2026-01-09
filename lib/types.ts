export interface Habit {
  id: number
  name: string
  emoji: string
  goal: string
  motivation: string
  start_date: string
  end_date: string | null
  reminder: boolean
  frequency: string[]
  color: string
  created_at: string
}

export interface HabitCompletion {
  id: number
  habit_id: number
  completed_date: string
  created_at: string
}

export interface HabitWithStats extends Habit {
  current_streak: number
  longest_streak: number
  completion_rate: number
  completions: HabitCompletion[]
  is_completed_today: boolean
}

export interface MoodEntry {
  id: number
  mood_type: string
  mood_level: string
  entry_date: string
  created_at: string
}
