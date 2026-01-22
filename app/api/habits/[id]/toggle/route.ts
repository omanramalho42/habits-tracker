import { type NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

import z from "zod"

import { getTodayString } from "@/lib/habit-utils"

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
    
    // 1️⃣ Busca a completion do dia
    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_completedDate: {
          habitId: id,
          completedDate,
        },
      },
      include: {
        habit: {
          select: {
            limitCounter: true,
          },
        },
      },
    })

    console.log(existingCompletion, "existing completion")

    // 2️⃣ NÃO EXISTE → cria
    if (!existingCompletion) {
      console.log("caso 1")
      const habit = await prisma.habit.findUnique({
        where: {
          id,
          userId: userDb.id
        },
        select: {
          limitCounter: true,
        },
      })

      if (!habit) {
        return NextResponse.json(
          { error: "Habit not found" },
          { status: 404 }
        )
      }

      const initialCounter = habit.limitCounter ? 1 : 0

      await prisma.$transaction([
        prisma.habitCompletion.create({
          data: {
            habitId: id,
        // 👉 se o hábito usa contador, inicia em 1
        ...(habit?.limitCounter
          && { counter: initialCounter }
          ),
            completedDate,
          },
        }),
      ])

      return NextResponse.json({
        completed: true,
        counter: habit.limitCounter ? initialCounter : null,
      })
    }

    // 3️⃣ EXISTE e NÃO TEM contador → toggle normal
    if (!existingCompletion.habit.limitCounter) {
      console.log("caso 2")
      await prisma.habitCompletion.delete({
        where: {
          id: existingCompletion.id,
        },
      })

      return NextResponse.json({ completed: false })
    }

    // 4️⃣ EXISTE e TEM contador
    const currentCounter = existingCompletion.counter ?? 0
    const limitCounter = existingCompletion.habit.limitCounter ?? 1

    console.log(currentCounter, limitCounter, "counter")
    // 4.1️⃣ Ainda não chegou no limite → incrementa
    if (currentCounter < limitCounter) {
      console.log("caso 3")
      const nextCounter = currentCounter + 1

      await prisma.habitCompletion.update({
        where: {
          id: existingCompletion.id
        },
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
    await prisma.habitCompletion.delete({
      where: {
        id: existingCompletion.id,
      },
    });

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