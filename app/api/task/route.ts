import { prisma } from "@/lib/prisma"
import { CreateTaskSchema } from "@/lib/schema/task"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
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
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: userDb.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        checkpoints: true,
        completions: true,
        goals: true,
        categories: true
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching tasks:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const parsedBody = CreateTaskSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      limitCounter,
      custom_field,
      goal
    } = parsedBody.data

    const newTask = await prisma.task.create({
      data: {
        userId: userDb.id,
        emoji,
        name,
        customField: custom_field,
        limitCounter: Number(limitCounter) || 1,
        ...(goal  && {goals: {
          connect: {
            id: goal
          }
        }}),
      },
      include: {
        completions: true,
      },
    })

    return NextResponse.json(newTask)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error create task:", error)
      return NextResponse.json({
        error: "Failed to create new task"
      }, { status: 500 })
    }
  }
}