import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTodayString } from "@/lib/habit-utils"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {
    const { id } = await params

    const body = await request.json()
    const date = body.date || getTodayString()
    
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)

    const existing = await prisma.habitCompletion.findFirst({
      where: {
        habitId: Number(id),
        completed_date: new Date(date)
      }, select: {
        id: true
      }
    })

    console.log(existing, "existing")

    if (existing) {
      // 2️⃣ Remove completion
      await prisma.habitCompletion.delete({
        where: {
          id: Number(existing.id),
          habitId: Number(id),
          completed_date: new Date(date)
        },
      })

      return NextResponse.json({
        completed: false
      })
    }

    // 3️⃣ Cria completion
    const newHabit = await prisma.habitCompletion.create({
      data: {
        habitId: Number(id),
        completed_date: new Date(date),
      },
    })

    console.log("created completion", newHabit)
    return NextResponse.json(newHabit)
  } catch (error) {
    if(error instanceof Error) {
      console.error("[v0] Error toggling habit completion:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}