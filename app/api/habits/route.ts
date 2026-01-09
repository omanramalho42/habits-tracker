import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import type { Habit } from "@/lib/types"

export async function GET() {
  try {
    const habits =
      await prisma.habit.findMany({
        orderBy: {
          createdAt: 'asc'
        }
      });

    return NextResponse.json(habits)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching habits:", error)
      return NextResponse.json({
        error: "Failed to fetch habits"
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      emoji,
      goal,
      motivation,
      start_date,
      reminder, 
      frequency,
      color
    } = body

    const newhHabit = await prisma.habit.create({
      data: {
        name,
        emoji,
        goal,
        motivation,
        startDate: new Date(start_date),
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
