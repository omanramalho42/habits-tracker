import { Goals, HabitStatus } from "@prisma/client"

export interface Habit {
  id: string
  name: string
  emoji?: string
  goals?: Goals[]
  clock?: string
  limitCounter?: number
  status: HabitStatus
  startDate: string
  endDate?: string | null
  reminder?: boolean
  frequency?: string[]
  completions?: HabitCompletion[]
  color?: string
  createdAt: string
  updatedAt?: string
}

export type WelcomeEmailData = {
  email: string;
  name: string;
  intro: string;
};

export interface HabitFormData {
  name: string
  emoji: string
  goal: string
  motivation: string
  startDate: string
  endDate: string | null
  reminder: boolean
  frequency: string[]
  color: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  completedDate: string
  counter?: number
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
  id: string
  mood_type: string
  mood_level: string
  entry_date: string
  created_at: string
}
