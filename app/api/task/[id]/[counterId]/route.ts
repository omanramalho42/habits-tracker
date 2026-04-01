import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import z from "zod"
import { putMetricSchema } from "@/lib/schema/metrics"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; counterId: string }> }
) {
  try {
    const { id: taskId, counterId } = await params

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      },
    })

    if (!userDb) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 401 })
    }

    const body = await request.json()

    const validator = z.object({
      taskMetric: putMetricSchema,
      date: z.coerce.date(),
    })

    const bodyParams = validator.safeParse(body)

    if (!bodyParams.success) {
      throw new Error("Invalid body format")
    }

    const {
      taskMetric,
      date
    } = bodyParams.data

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 1. pega counter atual
      const counter = await tx.counter.findUnique({
        where: {
          id: counterId
        },
      })

      if (!counter) throw new Error("Counter not found")

      const currentStep = Number(counter.valueNumber ?? 0)

      // 🛑 bloqueia se já atingiu limite
      if (currentStep >= Number(counter.limit)) {
        throw new Error("Counter limit reached")
      }

      const nextStep = currentStep + 1

      // 🔥 2. cria completion do dia (se quiser manter)
      const completion = await tx.taskCompletion.upsert({
        where: {
          taskId_completedDate: {
            taskId,
            completedDate: date,
          },
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          taskId,
          counterId,
          completedDate: date,
          isCompleted: nextStep >= Number(counter.limit),
        },
      })

      await tx.counter.update({
        where: { id: counter.id },
        data: {
          valueNumber: nextStep,
        },
      })

      await Promise.all(
        taskMetric.map((metric) =>
          tx.taskMetricCompletion.updateMany({
            where: {
              taskMetricId: metric.id!,
              index: nextStep, // 🔥 ATUAL (não nextStep - 1)
            },
            data: {
              value: metric.value,
              date: date,
              isComplete: true,
            },
          })
        )
      )
      return {
        step: nextStep,
        completionId: completion.id,
      }
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ ERROR:", error.message)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}