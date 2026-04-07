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
    const counter = await prisma.counter.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })

    // 2. (opcional) limpa métricas NÃO utilizadas
    // await prisma.taskMetric.deleteMany({
    //   where: {
    //     counterId: id,
    //   }
    // })
    
    return NextResponse.json(counter)
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
    const { id: counterId } = await params;
    const body = await request.json();

    const parsedBody = updateCounterSchema.safeParse(body);
    if (!parsedBody.success) throw new Error(parsedBody.error.message);

    const { label, limit, emoji, unit, metrics, taskId } = parsedBody.data;

    const { userId } = await auth();
    if (!userId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    });
    if (!userDb) return NextResponse.json({
      error: "user not found in db"
    }, { status: 401 });

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Atualiza Counter
      await tx.counter.update({
        where: { id: counterId },
        data: { label, emoji, limit, unit },
      })

      // 2️⃣ Atualiza métricas
      const existingMetrics = await tx.taskMetric.findMany({
        where: { taskId }
      });
      const toUpdate = metrics?.filter(m => m.id);
      const toCreate = metrics?.filter(m => !m.id);
      const toDelete = existingMetrics.filter(db => !metrics?.some(m => m.id === db.id));

      // Atualiza métricas existentes
      const updatedMetrics = await Promise.all(
        (toUpdate || []).map(metric =>
          tx.taskMetric.update({
            where: { id: metric.id },
            data: {
              emoji: metric.emoji,
              limit: metric.limit?.toString(),
              field: metric.field,
              unit: metric.unit,
              fieldType: mapType(metric.fieldType),
            },
          })
        )
      )

      // Cria novas métricas
      const createdMetrics = await Promise.all(
        (toCreate || []).map(metric =>
          tx.taskMetric.create({
            data: {
              emoji: metric.emoji,
              limit: metric.limit?.toString(),
              field: metric.field,
              unit: metric.unit,
              fieldType: mapType(metric.fieldType),
              taskId,
            },
          })
        )
      )

      // Remove métricas deletadas
      await tx.taskMetric.deleteMany({
        where: {
          id: {
            in: toDelete.map(m => m.id)
          }
        },
      })

      return {
        updatedMetrics,
        createdMetrics,
        deleted: toDelete.length,
      };
    });

    return NextResponse.json(result);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating counter:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}