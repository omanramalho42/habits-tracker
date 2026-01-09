import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateStreak, getTodayString } from "@/lib/habit-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params

    const habit = await prisma.habit.findUnique({
      where: {
        id: Number(id),
      }
    })

    if (!habit) {
      return NextResponse.json({
        error: "Habit not found"
      }, { status: 404 })
    }

    const completions = await prisma.habitCompletion.findMany({
      where: {
        habitId: Number(id)
      },
      orderBy: {
        completedDate: 'desc'
      }
    })

    const normalizedCompletions = completions.map((c) => ({
      ...c,
      completed_date: new Date(c.completedDate)
        .toISOString()
        .split("T")[0],
    }))

    const { currentStreak, longestStreak } = calculateStreak(normalizedCompletions)

    const today = getTodayString()
    const isCompletedToday =
      normalizedCompletions.some(
        (c) => c.completed_date === today
      )

    const totalDays =
      Math.floor((
        new Date().getTime() - new Date(habit.startDate).getTime()
      ) / (1000 * 60 * 60 * 24)) + 1

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
    if (error instanceof Error) {
      console.error("Error fetching habit stats:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
