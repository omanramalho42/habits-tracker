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
      metrics: putMetricSchema,
      date: z.coerce.date(),
    })

    const bodyParams = validator.safeParse(body)

    if (!bodyParams.success) {
      throw new Error("Invalid body format")
    }

    const {
      metrics,
      date
    } = bodyParams.data

    const baseDate = new Date(date);
    const startOfDay = new Date(baseDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(baseDate);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ pega o counter
      const counter = await tx.counter.findUnique({
        where: {
          id: counterId
        }
      })

      if (!counter) throw new Error("Counter not found");

      // 2️⃣ cria ou atualiza a TaskCompletion do dia
      const completion = await tx.taskCompletion.upsert({
        where: {
          taskId_completedDate: {
            taskId,
            completedDate: startOfDay
          }
        },
        update: {
          updatedAt: new Date()
        },
        create: {
          taskId,
          completedDate: startOfDay
        },
        include: {
          counterStep: true
        },
      })

      // 3️⃣ cria ou atualiza CounterStep
      const counterStep = await tx.counterStep.upsert({
        where: {
          counterId_date_completionId: {
            counterId: counter.id,
            date: startOfDay,
            completionId: completion.id,
          },
        },
        update: {
          updatedAt: new Date(),
          limit: counter.limit,
        },
        create: {
          counterId: counter.id,
          date: startOfDay,
          currentStep: 0,
          limit: counter.limit,
          completionId: completion.id,
        },
      })

      if (counterStep.currentStep >= counterStep.limit) {
        throw new Error("Daily counter limit reached")
      }

      const nextStep = counterStep.currentStep + 1

      // 4️⃣ atualiza CounterStep
      await tx.counterStep.update({
        where: { id: counterStep.id },
        data: { currentStep: nextStep },
      });

      // 5️⃣ atualiza Counter valueNumber
      // await tx.counter.update({
      //   where: { id: counter.id },
      //   data: { valueNumber: nextStep },
      // });

      // 6️⃣ cria/atualiza TaskMetricCompletions
      await Promise.all(
        metrics.map((metric) =>
          tx.taskMetricCompletion.upsert({
            where: {
              id: metric.id,
              // completionId_taskMetricId_step: {
                completionId: completion.id,
                taskMetricId: metric.id,
                step: nextStep,
              // },
            },
            create: {
              taskMetricId: metric.id!,
              completionId: completion.id,
              step: nextStep,
              value: metric.value || "",
              isComplete: !metric.isComplete,
              date: startOfDay,
            },
            update: {
              value: metric.value || "",
              isComplete: !metric.isComplete,
            },
          })
        )
      );

      return {
        step: nextStep,
        completionId: completion.id,
      }
    })

    return NextResponse.json(result)
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