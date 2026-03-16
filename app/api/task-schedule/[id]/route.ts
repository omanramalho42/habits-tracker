import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { updateTaskScheduleSchema } from '@/lib/schema/task-schedule'

export async function PATCH(request: NextRequest) {
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
    const parsedBody = updateTaskScheduleSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      task,
      duration,
      clock,
      id
    } = parsedBody.data
    // Verify the habitSchedule belongs to the user
    const existingSchedule = await prisma.taskSchedule.findFirst({
      where: {
        id,
        routine: {
          userId: userDb.id
        },
        status: 'ACTIVE'
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({
        error: "Schedule not found or access denied"
      }, { status: 404 })
    }

    const newTaskSchedule = await prisma.taskSchedule.update({
      where: { id },
      data: {
        clock,
        duration,
        task: {
          connect: {
            id: task.id
          }
        },
        updatedAt: new Date()
      }
    })

    return NextResponse.json(newTaskSchedule)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error task Schedule:", error)
      return NextResponse.json({
        error: "Failed to create new task schedule"
      }, { status: 500 })
    }
  }
}
