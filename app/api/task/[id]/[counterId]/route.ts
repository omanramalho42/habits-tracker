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

    const baseDate = new Date(date)

    const startOfDay = new Date(baseDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(baseDate)
    endOfDay.setHours(23, 59, 59, 999)

    console.log("📅 Day range:", { startOfDay, endOfDay })

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 1. pega counter atual
      const counter = await tx.counter.findUnique({
        where: {
          id: counterId
        },
      })

      if (!counter) throw new Error("Counter not found")
        const counterDay = await tx.counterAux.upsert({
          where: {
            counterId_date: {
              counterId: counter.id,
              date: startOfDay
            }
          },
          update: {},
          create: {
            counterId: counter.id,
            date: startOfDay,
            currentStep: 0,
            limit: counter.limit
          }
        })

      console.log("📊 CounterDay:", counterDay)

      const currentStep = counterDay.currentStep

      // 🛑 bloqueia se já atingiu limite
      if (currentStep >= Number(counterDay.limit)) {
        console.log("⛔ Daily limit reached:", {
          currentStep,
          limit: counterDay.limit
        })
        throw new Error("Daily counter limit reached")
      }

      const nextStep = currentStep + 1

      console.log("➡️ Step (daily):", {
        currentStep,
        nextStep
      })

      // 🔥 2. cria completion do dia (se quiser manter)
      const completion = await tx.taskCompletion.upsert({
        where: {
          taskId_completedDate: {
            taskId,
            completedDate: startOfDay
          },
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          taskId,
          counterId,
          completedDate: startOfDay,
          isCompleted: nextStep >= Number(counterDay.limit),
        },
      })
      await tx.counterAux.update({
        where: {
          id: counterDay.id
        },
        data: {
          currentStep: nextStep
        }
      })

      console.log("🔄 CounterDay updated:", nextStep)
      await tx.counter.update({
        where: { id: counter.id },
        data: {
          valueNumber: nextStep,
        },
      })

      // 🔥 cria ou atualiza metric completions corretamente
      await Promise.all(
        taskMetric
          .filter(metric => metric?.id) // evita null/undefined
          .map(metric => {
            console.log("🧩 Upserting metric completion:", {
              metricId: metric.id,
              step: nextStep,
              value: metric.value,
              taskId: taskId
            })

            return tx.taskMetricCompletion.upsert({
              where: {
                date_index_taskMetricId_taskId: {
                  date: startOfDay, // 🔥 padronizado
                  index: nextStep,
                  taskMetricId: metric.id!,
                  taskId,
                }
              },
              update: {
                value: metric.value,
                taskId,
                isComplete: true
              },
              create: {
                taskMetricId: metric.id!,
                index: nextStep,
                value: metric.value,
                date: startOfDay,
                isComplete: true,
                taskId,
              }
            })
          })
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