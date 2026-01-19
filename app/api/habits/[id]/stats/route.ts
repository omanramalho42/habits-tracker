import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateStreak } from "@/lib/habit-utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const habit = await prisma.habit.findUnique({
      where: {
        id,
      },
      include: {
        completions: {
          orderBy: {
            completedDate: "desc",
          },
        },
      },
    })

    if (!habit) {
      return NextResponse.json({
        error: "Habit not found"
      }, { status: 404 })
    }

    const calculateStreakHabits = habit.completions.map((c) => {
      return {
        completedDate: 
          new Date(c.completedDate)
          .toISOString().split("T")[0]
      }
    })
    
    const { currentStreak, longestStreak } = calculateStreak(calculateStreakHabits)

    const today = new Date().toISOString().split("T")[0]
    const isCompletedToday =
      habit.completions.some(
        (c) => new Date(c.completedDate)
        .toISOString()
        .split("T")[0] === today
      )

    const totalDays =
      Math.floor((
        new Date().getTime() - new Date(habit.startDate).getTime()
      ) / (1000 * 60 * 60 * 24)) + 1

    const completionRate =
      totalDays > 0 
      ? (habit.completions.length / totalDays) * 100 
      : 0

    return NextResponse.json({
      ...habit,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      completion_rate: Math.round(completionRate),
      completions: habit.completions,
      is_completed_today: isCompletedToday,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching habit stats:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
