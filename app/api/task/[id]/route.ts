import { type NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import {
  UpdateHabitSchema
} from "@/lib/schema/habit"
import { UpdateTaskSchema } from "@/lib/schema/task"


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
