import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateStreak } from "@/lib/habit-utils"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }

    const habit = await prisma.habit.findUnique({
      where: {
        id,
        userId: userDb.id,
        status: 'ACTIVE'
      },
      include: {
        completions: {
          include: {
            annotations: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                summary: true,
                createdAt: true
              }
            }
          },
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
      const completedDate = new Date(c.completedDate)
      completedDate.setHours(0, 0, 0, 0)

      return {
        completedDate: 
          completedDate.toISOString().split("T")[0]
      }
    })
    
    const { currentStreak, longestStreak } = calculateStreak(calculateStreakHabits)

    const today = new Date().toISOString().split("T")[0]
    const isCompletedToday =
      habit.completions.some(
        (c) => {
          const completedDate = new Date(c.completedDate)
          completedDate.setHours(0, 0, 0, 0)
          
          return completedDate
          .toISOString()
          .split("T")[0] === today
        }
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
