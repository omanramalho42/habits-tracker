import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { updateCounterSchema } from "@/lib/schema/counter"

import { mapType } from "@/lib/utils"
import { putMetricSchema } from "@/lib/schema/metrics"

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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: counterId } = await params

    const body = await request.json()

    const parsedBody = updateCounterSchema.safeParse(body)
    
    if(!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
    const {
      id,
      label,
      limit,
      emoji,
      unit,
      valueNumber,
      valueText,
      taskMetric
    } = parsedBody.data
    
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

    // const updatedCounter = await prisma.counter.update({
    //   where: {
    //     id: counterId
    //   },
    //   data: {
    //     label,
    //     emoji,
    //     limit,
    //     unit,
    //     taskMetric: {
    //       updateMany: {
    //         where: {
    //           counterId: counterId,
    //         },
    //         data: taskMetric?.map((metric: any) => ({
    //           emoji: metric.emoji,
    //           field: metric.field,
    //           value: metric.value,
    //           unit: metric.unit,
    //           fieldType: mapType(metric.fieldType || "numeric") as any, // depois vamos melhorar isso
    //         })) || [],
    //       },
    //     },
    //     // valueNumber,
    //     // valueText,
    //   },
    //   include: {
    //     taskMetric: true
    //   }
    // })

    await prisma.counter.update({
      where: { id: counterId },
      data: {
        label,
        emoji,
        limit,
        unit,
      }
    })
    const existingMetrics = await prisma.taskMetric.findMany({
      where: {
        counterId
      }
    })
    const incoming = taskMetric || []

    // UPDATE
    const toUpdate = incoming.filter(m => m.id)

    // CREATE
    const toCreate = incoming.filter(m => !m.id)

    // DELETE
    const toDelete = existingMetrics.filter(
      db => !incoming.some(m => m.id === db.id)
    )

    const updatedMetrics = await Promise.all(
      toUpdate.map(metric =>
        prisma.taskMetric.update({
          where: {
            id: metric.id
          },
          data: {
            emoji: metric.emoji,
            limit: metric.limit.toString(),
            index: metric.index,
            field: metric.field,
            value: metric.value,
            unit: metric.unit,
            fieldType: mapType(metric.fieldType),
          }
        })
      )
    )

    // ➕ creates
    const newMetrics = await prisma.taskMetric.createMany({
      data: toCreate.map(metric => ({
        limit: metric.limit.toString(),
        index: metric.index || "",
        emoji: metric.emoji,
        field: metric.field,
        value: metric.value,
        unit: metric.unit,
        fieldType: mapType(metric.fieldType),
        counterId
      }))
    })

    // ❌ deletes
    const deletedMetrics = await prisma.taskMetric.deleteMany({
      where: {
        id: {
          in: toDelete.map(m => m.id)
        }
      }
    })

    return NextResponse.json({
      newMetrics,
      deletedMetrics,
      updatedMetrics,
    })
  } catch (error) {
    if(error instanceof Error) {
      console.error("Error update counter id", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: counterId } = await params

    const body = await request.json()

    console.log("📥 BODY RECEBIDO:", body)

    // 🔥 valida array direto
    const parsed = putMetricSchema.safeParse(body)

    if (!parsed.success) {
      console.error("❌ VALIDATION ERROR:", parsed.error.format())
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      )
    }

    const metrics = parsed.data

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId,
      },
    })

    if (!userDb) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      )
    }

    // 🔥 busca existentes
    const existingMetrics = await prisma.taskMetric.findMany({
      where: {
        counterId,
      },
    })

    console.log("📊 EXISTENTES:", existingMetrics.length)

    //CRIAR COMPLETION CASO NAO EXISTE E VINCULAR METRICS

    // 🔥 separar operações
    const toUpdate = metrics.filter((m) => m.id)
    const toCreate = metrics.filter((m) => !m.id)

    const toDelete = existingMetrics.filter(
      (db) => !metrics.some((m) => m.id === db.id)
    )

    console.log("🟡 UPDATE:", toUpdate.length)
    console.log("🟢 CREATE:", toCreate.length)
    console.log("🔴 DELETE:", toDelete.length)

    const result = await prisma.$transaction(async (tx) => {
      // 🔥 pega o counter atual
      const counter = await tx.counter.findUnique({
        where: { id: counterId },
      })

      if (!counter) {
        throw new Error("Counter not found")
      }

      const currentValue = counter.valueNumber ?? 0
      const nextValue = currentValue + 1

      console.log("🔢 STEP ATUAL:", currentValue)
      console.log("🚀 NOVO STEP:", nextValue)

      const updated = await Promise.all(
        toUpdate.map((metric) =>
          tx.taskMetric.update({
            where: {
              id: metric.id!,
            },
            data: {
              value: metric.value,
              index: String(nextValue),
              isComplete: true,
              date: new Date(),
            },
          })
        )
      )

      // 🔥 CREATE
      const created = await tx.taskMetric.createMany({
        data: toCreate.map((metric) => ({
          emoji: metric.emoji,
          limit: metric.limit.toString(),
          index: String(nextValue), // 🔥 REGRA AQUI
          field: metric.field,
          value: metric.value,
          unit: metric.unit,
          date: new Date(),
          fieldType: mapType(metric.fieldType?.toLowerCase?.() || "numeric"),
          counterId,
        })),
      })

      // 🔥 DELETE
      const deleted = await tx.taskMetric.deleteMany({
        where: {
          id: {
            in: toDelete.map((m) => m.id),
          },
        },
      })

      // 🔥 ATUALIZA STEP GLOBAL
      await tx.counter.update({
        where: { id: counterId },
        data: {
          valueNumber: nextValue,
        },
      })

      return {
        updated,
        created,
        deleted,
        step: nextValue,
      }
    })

    console.log("✅ RESULT:", result)

    return NextResponse.json({
      success: true,
      ...result,
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ ERROR PUT METRICS:", error.message)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}