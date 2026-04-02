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
    if (!parsedBody.success) throw new Error(parsedBody.error.message)

    const { label, limit, emoji, unit, taskMetric, taskId, counterAuxId } = parsedBody.data

    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    if (!userDb) return NextResponse.json({
      error: "user not find on db"
    }, { status: 401 })

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Atualiza Counter
      await tx.counter.update({
        where: { id: counterId },
        data: { label, emoji, limit, unit },
        select: {
          id: true,
          CounterAux: true
        }
      })

    const { searchParams } = new URL(request.url)
    const paramDate = searchParams.get("selectedDate")

    const selectedDate = paramDate ? new Date(paramDate) : null
    
      // 🔥 Atualização segura do CounterAux para o dia atual
      const today = selectedDate ? new Date(selectedDate) : new Date()
      today.setHours(0, 0, 0, 0) // normaliza para o início do dia

      await tx.counterAux.upsert({
        where: {
          counterId_date: {
            counterId,
            date: today,
          },
        },
        update: {
          limit: Number(limit),       // atualiza o limite se necessário
          currentStep: 0,             // reinicia o passo atual, opcional
          updatedAt: new Date(),
        },
        create: {
          counterId,
          date: today,
          limit: Number(limit),
          currentStep: 0,
        },
      })

      // 2️⃣ Métricas existentes
      const existingMetrics = await tx.taskMetric.findMany({
        where: { counterId }
      })

      const incoming = taskMetric || []
      const toUpdate = incoming.filter((m) => m.id)
      const toCreate = incoming.filter((m) => !m.id)
      const toDelete = existingMetrics.filter(
        (db) => !incoming.some((m) => m.id === db.id)
      )

      // 3️⃣ Atualiza métricas
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

      // 4️⃣ Cria novas métricas
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

      // 5️⃣ Deleta métricas removidas + cascade completions
      await tx.taskMetric.deleteMany({
        where: { id: { in: toDelete.map((m) => m.id) } },
      })

      const allMetrics = [...updatedMetrics, ...createdMetrics]

      // 6️⃣ Criar completions apenas se taskId for fornecido
      let completionsCreated = 0
      if (taskId) {
        // Buscar completions existentes dessa task + métricas
        const existingCompletions = await tx.taskMetricCompletion.findMany({
          where: {
            taskMetricId: { in: allMetrics.map((m) => m.id) },
            taskId,
          },
          select: { taskMetricId: true, index: true },
        })

        // Mapear maior index por métrica
        const maxIndexByMetric = new Map<string, number>()
        for (const comp of existingCompletions) {
          const currentMax = maxIndexByMetric.get(comp.taskMetricId) || 0
          if (comp.index > currentMax) maxIndexByMetric.set(comp.taskMetricId, comp.index)
        }

        // 🔥 Criar completions faltantes individualmente
        let completionsCreated = 0

        for (const metric of allMetrics) {
          const currentMax = maxIndexByMetric.get(metric.id) || 0
          const targetLimit = Number(limit)

          for (let i = currentMax + 1; i <= targetLimit; i++) {
            await tx.taskMetricCompletion.create({
              data: {
                taskMetricId: metric.id,
                taskId, // ✅ relacionamento correto
                index: i,
                value: "",
                isComplete: false,
              },
            })
            completionsCreated++
          }
        }
      }

      return {
        updatedMetrics,
        createdMetrics,
        deleted: toDelete.length,
        completionsCreated,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error update counter id", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}