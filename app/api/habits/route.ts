import { z } from 'zod'

import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { isHabitActiveOnDate } from '@/lib/habit-utils'
import { Habit } from '@prisma/client'
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
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const paramDate = searchParams.get('selectedDate')
    
    const validator = z.string()
    const queryParams = validator.safeParse(paramDate)

    const habits = await prisma.habit.findMany({
      where: {
        userId: userDb.id,
      },
      include: {
        goals: true,
        completions: {
          orderBy: {
            completedDate: "desc"
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    if (queryParams.success) {
      if(queryParams.data) {
        const activeHabits: Habit[] = habits.filter((habit: any) =>
          isHabitActiveOnDate(habit, new Date(queryParams.data))
        )

        return NextResponse.json(activeHabits)
      }
    }
    return NextResponse.json(habits)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching habits:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
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
      goal
    } = parsedBody.data

    const newHabit = await prisma.habit.create({
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        reminder,
        frequency, // Json
        color,
        limitCounter: Number(limitCounter) || 1,
        ...(goal  && {goals: {
          connect: {
            id: goal
          }
        }}),
        clock
      },
      include: {
        completions: true,
      },
    })

    console.log(newHabit, "creating api")

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
