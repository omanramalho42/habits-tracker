import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { updateCounterSchema } from "@/lib/schema/counter"

import { log, mapType } from "@/lib/utils"
import { getTodayString } from "@/lib/habit-utils"
import z from "zod"
import { putMetricSchema } from "@/lib/schema/metrics"


export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string, counterId: string }> }) {
  try {
    const { id, counterId } = await params
    log("START", { taskId: id, counterId: counterId })
    
    const { userId } = await auth()
    log("AUTH USER", { userId })
  
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
    log("USER DB", userDb)
    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }

    const body = await request.json()
    
    const validator = z.object({
      taskMetric: putMetricSchema,
      date: z.coerce.date()
    })

    console.log(body, "body")
    
    const bodyParams = validator.safeParse(body)
    
    if (!bodyParams.success) {
      throw new Error("Invalid body format")
    }
    
    const completedDate =
      new Date(bodyParams.data.date)

    log("DATE RECEIVED", body?.date)
    log("PARSED DATE", completedDate)
    log("METRICS", bodyParams.data.taskMetric)

    // 1️⃣ Busca a completion do dia
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_completedDate: {
          taskId: id,
          completedDate,
        },
      },
      include: {
        counter: {
          include: {
            taskMetric: true,
          },
        },
      },
    })
    log("EXISTING COMPLETION", existingCompletion)

    if(!existingCompletion) {
      log("NOT EXIST COMPLETION")
    }

    const counter = await prisma.counter.findUnique({
      where: {
        id: counterId
      }
    })

    if(Number(counter?.valueNumber) > Number(counter?.limit)) {
      return;
    }

    console.log(counter, 'counter');

    await prisma.$transaction(
      bodyParams.data.taskMetric.map((metric) =>
        prisma.taskMetric.update({
          where: {
            id: metric.id!,
          },
          data: {
            value: metric.value,
            date: new Date(bodyParams.data.date),
            isComplete: true,
          },
        })
      )
    )

    await prisma.counter.update({
      where: {
        id: counterId,
      },
      data: {
        valueNumber: (Number(counter?.valueNumber) ?? 0) + 1,
      },
    })

    return NextResponse.json({
      completion: existingCompletion,
      completed: false,
      counter: 0,
    })
} catch (error) {
    if (error instanceof Error) {
      console.error("Error toggling task completion:", error.message)
      console.error("❌ ERROR TOGGLING TASK", {
        message: error.message,
        stack: error.stack,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}