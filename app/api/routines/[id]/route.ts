import { z } from 'zod'

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { updateRoutineSchema } from '@/lib/schema/routine'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    
    const { id } = await params
    const body = await request.json()
    
    const zodSchema = z.object({
      habitScheduleId: z.string(),
    })

    const parsedBody = zodSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      habitScheduleId
    } = parsedBody.data

    const newRoutine = await prisma.routine.update({
      where: {
        id,
        userId: userDb.id
      },
      data: {
        habitSchedules: {
          disconnect: {
            id: habitScheduleId
          }
        }
      }
    })

    return NextResponse.json(newRoutine)
  } catch (error) {
    console.error("Error updating routine:", error)
    return NextResponse.json({
      error: "Failed to update routine"
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: routineId } = await params
    const body = await request.json()
    const parsedBody = updateRoutineSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const { name, emoji, dateRange, habits, cron, description, frequency } = parsedBody.data
    
    const newStartdate = new Date(dateRange.from)
      newStartdate.setHours(0,0,0,0)
    const newEnddate = 
      dateRange.to ? new Date(dateRange.to) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newRoutine = await prisma.routine.update({
      where: { id: routineId, userId: userDb.id },
      data: {
        userId: userDb.id,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        frequency,
        cron,
        name,
        description,

        habitSchedules: {
          deleteMany: {},
          create: habits?.map((habitId: string) => ({
            habit: {
              connect: { id: habitId }
            }
          }))
        }
      }
    })
    return NextResponse.json(newRoutine)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error routine habits:", error)
      return NextResponse.json({
        error: "Failed to create new routine"
      }, { status: 500 })
    }
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params

    await prisma.routine.delete({
      where: {
        id,
        userId: userDb.id
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error routine habits:", error)
      return NextResponse.json({
        error: "Failed to delete routine"
      }, { status: 500 })
    }
  }

}
