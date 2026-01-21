import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTodayString } from "@/lib/habit-utils"
import z from "zod"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const body = await request.json()
    const { date }: { date: Date } = body || getTodayString()

    const validator = z.string().datetime()
    const bodyParams = validator.safeParse(date)

    if (!bodyParams.success) {
      throw new Error("Invalid date format")
    }

    const completedDate =
      new Date(bodyParams.data)
    
    const existing = await prisma.habitCompletion.findFirst({
      where: {
        habitId: id,
        completedDate,
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
          completedDate,
        },
      })

      return NextResponse.json({ completed: true })
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
    if (error instanceof Error) {
      console.error("Error toggling habit completion:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}