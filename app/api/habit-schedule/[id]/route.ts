import { z } from 'zod'

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { updateHabitScheduleSchema } from '@/lib/schema/habit-schedule'

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
    const parsedBody = updateHabitScheduleSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      habit,
      duration,
      clock,
      id
    } = parsedBody.data
    // Verify the habitSchedule belongs to the user
    const existingSchedule = await prisma.habitSchedule.findFirst({
      where: {
        id,
        routine: {
          userId: userDb.id
        }
      }
    })

    if (!existingSchedule) {
      return NextResponse.json({
        error: "Schedule not found or access denied"
      }, { status: 404 })
    }
    const newHabitSchedule = await prisma.habitSchedule.update({
      where: { id },
      data: {
        clock,
        duration,
        habit: {
          connect: {
            id: habit.id
          }
        },
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json(newHabitSchedule)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error routine habits:", error)
      return NextResponse.json({
        error: "Failed to create new routine"
      }, { status: 500 })
    }
  }
}
