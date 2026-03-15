import { type NextRequest, NextResponse } from "next/server"

import z from "zod"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { UpdateTaskSchema } from "@/lib/schema/task"
import { getTodayString } from "@/lib/habit-utils"

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

    await prisma.task.delete({
      where: {
        id,
        userId: userDb.id
      }, include: {
        schedules:  true
      }
    })
  
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting task:", error.message)
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

    const parsedBody = UpdateTaskSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
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
      await prisma.task.update({
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
      await prisma.task.update({
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const newTask = await prisma.task.update({
      where: {
        id
      },
      data: {
        userId: userDb.id,
        name,
        emoji,
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
        }})
      },
      include: {
        completions: true,
      },
    })

    return NextResponse.json(newTask)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating task:", error.message)
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

    const body = await request.json()
    const date = body?.date ?? getTodayString()
    
    const validator = z.string().datetime()
    const bodyParams = validator.safeParse(date)
    
    if (!bodyParams.success) {
      throw new Error("Invalid date format")
    }
    
    const completedDate =
      new Date(bodyParams.data)

    completedDate.setHours(0, 0, 0, 0)
    // console.log(new Date(completedDate), "completedDate");
    
    // 1️⃣ Busca a completion do dia
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_completedDate: {
          taskId: id,
          completedDate: new Date(completedDate),
        },
      },
      include: {
        task: {
          select: {
            limitCounter: true,
          },
        },
      },
    })

    // 2️⃣ NÃO EXISTE → cria
    if (!existingCompletion) {
      const task = await prisma.task.findUnique({
        where: {
          id,
          userId: userDb.id,
          status: "ACTIVE"
        },
        select: {
          limitCounter: true,
        },
      })

      if (!task) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        )
      }

      const initialCounter = task.limitCounter ? 1 : 0

      await prisma.$transaction([
        prisma.taskCompletion.create({
          data: {
            taskId: id,
        // 👉 se o hábito usa contador, inicia em 1
        ...(task?.limitCounter
          && { counter: initialCounter }
          ),
            completedDate,
          },
        }),
      ])

      return NextResponse.json({
        completed: true,
        counter: task.limitCounter ? initialCounter : null,
      })
    }

    // 3️⃣ EXISTE e NÃO TEM contador → toggle normal
    if (!existingCompletion.task.limitCounter) {
      await prisma.taskCompletion.delete({
        where: {
          id: existingCompletion.id,
        },
      })

      return NextResponse.json({ completed: false })
    }

    // 4️⃣ EXISTE e TEM contador
    const currentCounter = existingCompletion.counter ?? 0
    const limitCounter = existingCompletion.task.limitCounter ?? 1

    // 4.1️⃣ Ainda não chegou no limite → incrementa
    if (currentCounter < limitCounter) {
      const nextCounter = currentCounter + 1

      await prisma.taskCompletion.update({
        where: {
          id: existingCompletion.id
        },
        data: {
          counter: nextCounter,
          updatedAt: new Date()
        },
      })

      return NextResponse.json({
        completed: true,
        counter: nextCounter,
      })
    }
    // 4.2️⃣ Chegou no limite → reset
    await prisma.taskCompletion.delete({
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
      console.error("Error toggling task completion:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
