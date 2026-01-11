export interface Habit {
  id: number
  name: string
  emoji: string
  goal: string
  motivation: string
  startDate: string
  endDate: string | null
  reminder: boolean
  frequency: string[]
  color: string
  createdAt: string
}

export interface HabitCompletion {
  id: number
  habitId: number
  completedDate: string
  createdAt: string
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
