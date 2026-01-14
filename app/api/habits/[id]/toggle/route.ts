import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTodayString } from "@/lib/habit-utils"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()
    const date = body.date || getTodayString()

    const existing = await prisma.habitCompletion.findFirst({
      where: {
        habitId: id,
        completedDate: new Date(date)
      }, select: {
        id: true
      }
    })

    if (existing) {
      // 2️⃣ Remove completion
      await prisma.habitCompletion.delete({
        where: {
          id: existing.id,
          habitId: id,
          completedDate: new Date(date)
        },
      })

      return NextResponse.json({
        completed: false
      })
    }

    // 3️⃣ Cria completion
    const newHabit = await prisma.habitCompletion.create({
      data: {
        habitId: id,
        completedDate: new Date(date),
      },
    })
    return NextResponse.json(newHabit)
  } catch (error) {
    if(error instanceof Error) {
      console.error("[v0] Error toggling habit completion:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}