import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { calculateStreak, WEEKDAY_MAP } from '@/lib/habit-utils'
import { CreateHabitSchema } from '@/lib/schema/habit'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })

    if (!userDb) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paramDate = searchParams.get("selectedDate")

    const selectedDate = paramDate ? new Date(paramDate) : null

    const habits = await prisma.habit.findMany({
      where: {
        userId: userDb.id,
        status: "ACTIVE",
        ...(selectedDate && {
          startDate: { lte: selectedDate },
          OR: [
            { endDate: null },
            { endDate: { gte: selectedDate } }
          ]
        })
      },
      orderBy: { createdAt: "asc" },
      include: {
        completions: {
          orderBy: {
            completedDate: "desc"
          }
        },
        categories: { where: { status: "ACTIVE" } },
        goals: { where: { status: "ACTIVE" } },
        schedules: true
      }
    })

    // 🔥 filtra frequência (única parte que ainda precisa ser JS)
    let filteredHabits = habits

    if (selectedDate) {
      const dayOfWeek = selectedDate.getUTCDay()

      filteredHabits = habits.filter(habit =>
        (habit.frequency as string[])?.some(
          key => WEEKDAY_MAP[key] === dayOfWeek
        )
      )
    }

    // 🔥 adiciona stats direto aqui
    const result = filteredHabits.map(habit => {
      const completions = habit.completions

      // 📅 normaliza datas
      const normalized = completions.map(c => {
        const d = new Date(c.completedDate!)
        d.setHours(0, 0, 0, 0)

        return {
          completedDate: d.toISOString().split("T")[0]
        }
      })

      const { currentStreak, longestStreak } =
        calculateStreak(normalized)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const isCompletedToday = completions.some(c => {
        const d = new Date(c.completedDate!)
        d.setHours(0, 0, 0, 0)
        return d.getTime() === today.getTime()
      })

      const completionRate =
        completions.length > 0
          ? (completions.length / 365) * 100
          : 0

      return {
        ...habit,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        completion_rate: Math.round(completionRate),
        is_completed_today: isCompletedToday
      }
    })

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching habits:", error.message)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  try {
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
    
    const body = await request.json()

    const parsedBody = CreateHabitSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      endDate,
      startDate,
      reminder, 
      frequency,
      color,
      clock,
      limitCounter,
      custom_field,
      duration,
      goals,
      categories
    } = parsedBody.data

    const date = startDate ? new Date(startDate) : new Date()
    const newStartdate = new Date(date)
      newStartdate.setHours(0,0,0,0)
    const newEnddate = 
      endDate ? new Date(endDate) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newHabit = await prisma.habit.create({
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        reminder,
        frequency, // Json
        color,
        customField: custom_field,
        duration,
        limitCounter: Number(limitCounter) || 1,
        ...(goals  && {goals: {
          connect: {
            id: goals
          }
        }}),
        ...(categories  && {categories: {
          connect: {
            id: categories
          }
        }}),
        clock
      },
      include: {
        completions: true,
      },
    })
    console.log(newHabit, "new habit")
    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error create habits:", error)
      return NextResponse.json({
        error: "Failed to create new habit"
      }, { status: 500 })
    }
  }
}
