import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { Habit } from "@/lib/types"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params

    await prisma.habit.delete({
      where: {
        id
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting habit:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params

    const body = await request.json()
    const {
      name,
      emoji,
      goal,
      motivation,
      reminder,
      frequency,
      color,
      start_date,
      end_date
    } = body

    const newHabit = await prisma.habit.update({
      where: {
        id
      },
      data: {
        name,
        emoji,
        goal,
        motivation,
        reminder,
        frequency: JSON.stringify(frequency),
        color,
        startDate: start_date,
        endDate: end_date
      }
    })

    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating habit:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
