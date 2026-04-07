import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { createCounterSchema } from "@/lib/schema/counter"
import { mapType } from "@/lib/utils"

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const counters = await prisma.counter.findMany({
      where: {
        status: "ACTIVE",
        userId: userDb.id
      },
      include: {
        CounterStep: true
      }
    })

    return NextResponse.json(
      counters
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching counters:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedBody = createCounterSchema.safeParse(body)
    
    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
  
    const {
      label,
      limit,
      emoji,
      unit,
      taskId,
      metrics
    } = parsedBody.data
    
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json(
        { error: "user not find on db" },
        { status: 401 }
      )
    }
    
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ cria counter
      const counter = await tx.counter.create({
        data: {
          label,
          emoji,
          userId: userDb.id,
          limit,
          unit,
        }
      })

      // 2️⃣ cria TaskMetric desvinculadas de Task (opcional)
      const createdMetrics = await Promise.all(
        (metrics || []).map((metric) =>
          tx.taskMetric.create({
            data: {
              taskId: "",
              emoji: metric.emoji,
              field: metric.field,
              unit: metric.unit,
              limit: metric.limit?.toString(),
              fieldType: mapType(metric.fieldType),
            }
          })
        )
      )
      
      return {
        counter,
        metrics: createdMetrics
      }
    })

    return NextResponse.json({
      newCounter: result.counter,
      metrics: result.metrics
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error posting counter&metrics:", error.message)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}


      // const today = new Date()
      // today.setHours(0, 0, 0, 0)

      // const counterStep = await tx.counterStep.create({
      //   data: {
      //     counterId: counter.id,
      //     date: today,
      //     currentStep: 0,
      //     limit: counter.limit
      //   }
      // })
      // console.log("📅 counterStep created:", counterStep)
      // 2️⃣ cria templates (TaskMetric)
      // const createdMetrics = await Promise.all(
      //   (taskMetric || []).map((metric) =>
      //     tx.taskMetric.create({
      //       data: {
      //         emoji: metric.emoji,
      //         field: metric.field,
      //         unit: metric.unit,
      //         limit: metric.limit.toString(),
      //         fieldType: mapType(metric.fieldType),
      //         counterId: counter.id,
      //       }
      //     })
      //   )
      // )

      // 3️⃣ cria completions (TaskMetricCompletion)
      // const completions = createdMetrics.flatMap((metric) =>
      //   Array.from({ length: Number(limit) }).map((_, i) => ({
      //     taskMetricId: metric.id,
      //     index: i + 1, // 🔥 step (1 até limit)
      //     value: "", // vazio inicialmente
      //     isComplete: false,
      //     date: null,
      //   }))
      // )

      // await tx.taskMetricCompletion.createMany({
      //   data: completions
      // })