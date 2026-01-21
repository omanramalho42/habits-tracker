import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      startDate,
      endDate
    } = body

    const newHabit = await prisma.habit.update({
      where: {
        id
      },
      data: {
        name: name,
        emoji: emoji,
        reminder: reminder,
        frequency: frequency,
        color: color,
        startDate: startDate,
        endDate: endDate
      }
    })

    console.log(newHabit, "updating")

    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating habit:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
