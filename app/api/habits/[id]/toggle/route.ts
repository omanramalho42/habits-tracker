import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getTodayString } from "@/lib/habit-utils"
import z from "zod"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json()
    const date = body?.date ?? getTodayString()

    const validator = z.string().datetime()
    const bodyParams = validator.safeParse(date)

    if (!bodyParams.success) {
      throw new Error("Invalid date format")
    }

    const completedDate =
      new Date(bodyParams.data)
    
    console.log(completedDate, "completed date")
    
    // 1️⃣ Busca a completion existente
    const existingCompletion = await prisma.habitCompletion.findFirst({
      where: {
        habitId: id,
        completedDate,
      },
      include: {
        habit: true,
      },
    })

    // 2️⃣ NÃO EXISTE → cria
    if (!existingCompletion) {
      const habit = await prisma.habit.findUnique({
        where: { id },
        select: {
          counter: true,
          limitCounter: true,
        },
      })

      await prisma.$transaction([
        prisma.habitCompletion.create({
          data: {
            habitId: id,
            completedDate,
          },
        }),

        // 👉 se o hábito usa contador, inicia em 1
        ...(habit?.limitCounter
          ? [
              prisma.habit.update({
                where: { id },
                data: { counter: 1 },
              }),
            ]
          : []),
      ])

      return NextResponse.json({
        completed: true,
        counter: habit?.limitCounter ? 1 : null,
      })
    }

    // 3️⃣ EXISTE e NÃO TEM contador → toggle normal
    if (!existingCompletion.habit.limitCounter) {
      await prisma.habitCompletion.delete({
        where: {
          id: existingCompletion.id,
        },
      })

      return NextResponse.json({ completed: false })
    }

    // 4️⃣ EXISTE e TEM contador
    const currentCounter = existingCompletion.habit.counter ?? 0
    const limitCounter = existingCompletion.habit.limitCounter ?? 1

    // 4.1️⃣ Ainda não chegou no limite → incrementa
    if (currentCounter < limitCounter) {
      const nextCounter = currentCounter + 1

      await prisma.habit.update({
        where: { id },
        data: {
          counter: nextCounter,
        },
      })

      return NextResponse.json({
        completed: true,
        counter: nextCounter,
      })
    }

    // 4.2️⃣ Chegou no limite → reset
    await prisma.$transaction([
      prisma.habitCompletion.delete({
        where: {
          id: existingCompletion.id,
        },
      }),
      prisma.habit.update({
        where: { id },
        data: {
          counter: 0,
        },
      }),
    ])

    return NextResponse.json({
      completed: false,
      counter: 0,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error toggling habit completion:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}