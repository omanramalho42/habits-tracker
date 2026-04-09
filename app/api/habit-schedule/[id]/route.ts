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
      id,
      alarms 
    } = parsedBody.data

    const existingSchedule = await prisma.habitSchedule.findFirst({
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

    const updatedHabitSchedule = await prisma.habitSchedule.update({
      where: { id },
      data: {
        clock,
        duration,
        habit: {
          connect: { id: habit.id }
        },
        // Gerenciamento de Alarmes
        alarms: {
          // Estratégia: Deleta os antigos e cria os novos selecionados
          deleteMany: {}, 
          create: alarms?.map(alarm => ({
            triggerTime: alarm.triggerTime,
            message: alarm.message || "Lembrete de hábito",
          }))
        },
        updatedAt: new Date()
      },
      include: {
        alarms: true
      }
    })

    return NextResponse.json(updatedHabitSchedule)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error habit Schedule:", error)
      return NextResponse.json({
        error: "Failed to create new habit schedule"
      }, { status: 500 })
    }
  }
}
