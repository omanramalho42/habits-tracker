import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { updateCounterSchema } from "@/lib/schema/counter"

import { mapType } from "@/lib/utils"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

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

    // 1. Arquiva counter
    await prisma.counter.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })

    // 2. (opcional) limpa métricas NÃO utilizadas
    await prisma.taskMetric.deleteMany({
      where: {
        counterId: id,
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting counter id:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: counterId } = await params

    const body = await request.json()

    const parsedBody = updateCounterSchema.safeParse(body)

    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }

    const {
      label,
      limit,
      emoji,
      unit,
      taskMetric,
    } = parsedBody.data

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId },
    })

    if (!userDb) {
      return NextResponse.json(
        { error: "user not find on db" },
        { status: 401 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 1. update counter
      await tx.counter.update({
        where: { id: counterId },
        data: {
          label,
          emoji,
          limit,
          unit,
        },
      })

      // 🔥 2. existing metrics
      const existingMetrics = await tx.taskMetric.findMany({
        where: {
          counterId
        },
      })

      const incoming = taskMetric || []

      const toUpdate = incoming.filter((m) => m.id)
      const toCreate = incoming.filter((m) => !m.id)

      const toDelete = existingMetrics.filter(
        (db) => !incoming.some((m) => m.id === db.id)
      )

      // 🔥 3. update templates
      const updatedMetrics = await Promise.all(
        toUpdate.map((metric) =>
          tx.taskMetric.update({
            where: { id: metric.id },
            data: {
              emoji: metric.emoji,
              limit: metric.limit.toString(),
              field: metric.field,
              unit: metric.unit,
              fieldType: mapType(metric.fieldType),
            },
          })
        )
      )

      // 🔥 4. create templates
      const createdMetrics = await Promise.all(
        toCreate.map((metric) =>
          tx.taskMetric.create({
            data: {
              limit: metric.limit.toString(),
              emoji: metric.emoji,
              field: metric.field,
              unit: metric.unit,
              fieldType: mapType(metric.fieldType),
              counterId,
            },
          })
        )
      )

      // 🔥 5. delete templates + cascade completions
      await tx.taskMetric.deleteMany({
        where: {
          id: {
            in: toDelete.map((m) => m.id),
          },
        },
      })

      // 🔥 6. juntar todos os templates válidos
      const allMetrics = [...updatedMetrics, ...createdMetrics]

      // 🔥 7. buscar completions existentes
      const existingCompletions = await tx.taskMetricCompletion.findMany({
        where: {
          taskMetricId: {
            in: allMetrics.map((m) => m.id),
          },
        },
        select: {
          taskMetricId: true,
          index: true,
        },
      })

      // 🔥 8. mapear maior index por metric
      const maxIndexByMetric = new Map<string, number>()

      for (const comp of existingCompletions) {
        const currentMax = maxIndexByMetric.get(comp.taskMetricId) || 0

        if (comp.index > currentMax) {
          maxIndexByMetric.set(comp.taskMetricId, comp.index)
        }
      }

      // 🔥 9. criar apenas os novos steps
      const completionsToCreate = allMetrics.flatMap((metric) => {
        const currentMax = maxIndexByMetric.get(metric.id) || 0

        // nada pra criar
        if (currentMax >= Number(limit)) return []

        return Array.from({
          length: Number(limit) - currentMax,
        }).map((_, i) => ({
          taskMetricId: metric.id,
          index: currentMax + i + 1,
          value: "",
          isComplete: false,
        }))
      })

      // 🔥 10. criar somente se houver
      if (completionsToCreate.length > 0) {
        await tx.taskMetricCompletion.createMany({
          data: completionsToCreate,
        })
      }
      return {
        updatedMetrics,
        createdMetrics,
        deleted: toDelete.length,
        completionsCreated: completionsToCreate.length,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error update counter id", error.message)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}