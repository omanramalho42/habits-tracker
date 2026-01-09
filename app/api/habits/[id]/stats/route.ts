import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Habit, HabitCompletion } from "@/lib/types"
import { calculateStreak, getTodayString } from "@/lib/habit-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const [habit] = await sql<Habit[]>`
      SELECT * FROM habits WHERE id = ${id}
    `

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 })
    }

    const completions = await sql<HabitCompletion[]>`
      SELECT * FROM habit_completions 
      WHERE habit_id = ${id}
      ORDER BY completed_date DESC
    `

    const normalizedCompletions = completions.map((c) => ({
      ...c,
      completed_date: new Date(c.completed_date).toISOString().split("T")[0],
    }))

    const { currentStreak, longestStreak } = calculateStreak(normalizedCompletions)

    const today = getTodayString()
    const isCompletedToday = normalizedCompletions.some((c) => c.completed_date === today)

    const totalDays =
      Math.floor((new Date().getTime() - new Date(habit.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1

    const completionRate = totalDays > 0 ? (normalizedCompletions.length / totalDays) * 100 : 0

    return NextResponse.json({
      ...habit,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      completion_rate: Math.round(completionRate),
      completions: normalizedCompletions,
      is_completed_today: isCompletedToday,
    })
  } catch (error) {
    console.error("Error fetching habit stats:", error)
    return NextResponse.json({ error: "Failed to fetch habit stats" }, { status: 500 })
  }
}
