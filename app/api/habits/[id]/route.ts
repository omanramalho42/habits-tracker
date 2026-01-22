import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  UpdateHabitSchema,
  type UpdateHabitSchemaType
} from "@/lib/schema/habit"
import { auth } from "@clerk/nextjs/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const parsedBody = UpdateHabitSchema.safeParse(body)

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
      status,
      goal
    } = parsedBody.data

    const existingGoal = await prisma.goals.findFirst({
      where: {
        id: goal
      }
    })

    if(existingGoal) {
      await prisma.habit.update({
        where: {
          id
        },
        data: {
          goals: {
            disconnect: {
              id: existingGoal.id
            }
          }
        }
      })
    }

    //QUANDO ATUALIZAR UM HÁBITO, EU DEVO PERCORRER MEUS COMPLETIONS DO HABITO E ATUALIZAR O LIMIT COUNTER

    const newHabit = await prisma.habit.update({
      where: {
        id
      },
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        reminder,
        frequency, // Json
        color,
        limitCounter,
        updatedAt: new Date(),
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

    console.log(newHabit, "updating")

    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating habit:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
