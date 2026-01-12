import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if (!userDb) {
      return NextResponse.json({ error: "user not find on db" }, { status: 401 })
    }

    const habits =
      await prisma.habit.findMany({
        where: {
          userId: userDb.id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if (!userDb) {
      return NextResponse.json({ error: "user not find on db" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      emoji,
      goal,
      motivation,
      endDate,
      startDate,
      reminder, 
      frequency,
      color
    } = body

    const newhHabit = await prisma.habit.create({
      data: {
        userId: userDb.id,
        name,
        emoji,
        goal,
        motivation,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reminder,
        frequency, // Json
        color,
      },
    })

    return NextResponse.json(newhHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error create habits:", error)
      return NextResponse.json({
        error: "Failed to create new habit"
      }, { status: 500 })
    }
  }
}
