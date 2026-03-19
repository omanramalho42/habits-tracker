import { type NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import {
  UpdateHabitSchema
} from "@/lib/schema/habit"
import { getTodayString } from "@/lib/habit-utils"
import z from "zod"
import { HabitCompletion } from "@prisma/client"


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

    await prisma.$transaction([
      prisma.habitSchedule.deleteMany({
        where: { habitId: id }
      }),
      prisma.habit.delete({
        where: { id }
      })
    ])
    
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
      goals,
      categories
    } = parsedBody.data

    const existingGoal = await prisma.goals.findFirst({
      where: {
        id: goals
      }
    })

    if(existingGoal) {
      await prisma.habit.update({
        where: {
          id,
          userId: userDb.id
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

    const existingCategorie = await prisma.categories.findFirst({
      where: {
        id: categories
      }
    })

    if(existingCategorie) {
      await prisma.habit.update({
        where: {
          id,
          userId: userDb.id
        },
        data: {
          categories: {
            disconnect: {
              id: existingCategorie.id
            }
          }
        }
      })
    }

    //QUANDO ATUALIZAR UM HÁBITO, EU DEVO PERCORRER MEUS COMPLETIONS DO HABITO E ATUALIZAR O LIMIT COUNTER
    const newStartdate = new Date(startDate)
      newStartdate.setHours(0,0,0,0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newEnddate = 
      endDate ? new Date(endDate) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newHabit = await prisma.habit.update({
      where: {
        id
      },
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        reminder,
        frequency, // Json
        color,
        limitCounter,
        updatedAt: today,
        ...(goals  && {goals: {
          connect: {
            id: goals
          }
        }}),
        ...(categories  && {categories: {
          connect: {
            id: categories
          }
        }}),
        clock
      },
      include: {
        completions: true,
      },
    })

    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating habit:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    console.log(id, "id")

    const body = await request.json()
    const date = body?.date ?? getTodayString()
    
    const validator = z.string()
    const bodyParams = validator.safeParse(date)
    
    if (!bodyParams.success) {
      throw new Error("Invalid date format")
    }
    
    const completedDate =
      new Date(bodyParams.data)

    console.log(completedDate, "completed_date  ")
    // 1️⃣ Busca a completion do dia
    const existingCompletion =
      await prisma.habitCompletion.findUnique({
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

    // 2️⃣ NÃO EXISTE → cria
    if (!existingCompletion) {
      const habit = await prisma.habit.findUnique({
        where: {
          id,
          userId: userDb.id,
          status: "ACTIVE"
        },
        select: {
          limitCounter: true,
        },
      })

      if (!habit) {
        return NextResponse.json(
          { error: "habit not found" },
          { status: 404 }
        )
      }

      const initialCounter = habit.limitCounter ? 1 : 0

      const newHabitCompletion = await prisma.$transaction([
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
        completion: newHabitCompletion,
        completed: true,
        counter: habit.limitCounter ? initialCounter : null,
      })
    }

    // 3️⃣ EXISTE e NÃO TEM contador → toggle normal
    // if (!existingCompletion.habit.limitCounter) {
    //   await prisma.habitCompletion.delete({
    //     where: {
    //       id: existingCompletion.id,
    //     },
    //   })

    //   return NextResponse.json({ completed: false })
    // }

    // 4️⃣ EXISTE e TEM contador
    const currentCounter =
      existingCompletion.counter ?? 0
    const limitCounter =
      existingCompletion.habit.limitCounter ?? 1

    // 4.1️⃣ Ainda não chegou no limite → incrementa
    if (currentCounter < limitCounter) {
      const nextCounter = currentCounter + 1

      const updatedHabitCompletion =
        await prisma.habitCompletion.update({
            where: {
              id: existingCompletion.id
            },
            data: {
              counter: nextCounter,
              updatedAt: new Date()
            },
        })

      return NextResponse.json({
        completion: updatedHabitCompletion,
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
      completion: existingCompletion,
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
