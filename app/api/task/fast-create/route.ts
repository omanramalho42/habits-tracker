import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// Adicione isso no topo do arquivo
export const dynamic = 'force-dynamic';

export const CreateTaskFullSchema = z.object({
  name: z.string().min(3).max(100),

  description: z.string().max(255).optional(),

  emoji: z.string().max(10).optional(),

  color: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),

  // 🎯 GOAL
  goal: z.object({
    name: z.string().min(2),
    emoji: z.string().max(10).optional()
  }).optional(),

  // 📂 CATEGORY
  category: z.object({
    name: z.string().min(2),
    emoji: z.string().max(10).optional(),
    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
  }).optional(),

  // 🔢 COUNTER (OBRIGATÓRIO)
  counter: z.object({
    label: z.string().min(2).max(20),
    value: z.number().min(1),
    unit: z.string().optional()
  }),

  // 📊 METRICS (OBRIGATÓRIO)
  metrics: z.array(
    z.object({
      emoji: z.string().max(20).optional(),
      field: z.string().max(20).optional(),
      value: z.string().max(20).optional(),
      unit: z.string().optional(),

      // ⚠️ IMPORTANTE
      date: z.date().nullable().optional()
      // Prisma já define null automaticamente
    })
  ).min(1)
})

export async function POST(request: NextRequest) {
  console.log("🚀 Rota POST /fast-create chamada!");
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // 1. Validamos que o corpo é um ARRAY de tarefas
    const parsed = z.array(CreateTaskFullSchema).safeParse(body);

    if (!parsed.success) {
      console.log("⚠️ Falha no Zod:", parsed.error.flatten());
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    });

    if (!userDb) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // 2. Usamos Promise.all para criar todas as tarefas do array
    const createdTasks = await Promise.all(
      parsed.data.map(async (taskData) => {
        return prisma.task.create({
          data: {
            name: taskData.name,
            description: taskData.description,
            emoji: taskData.emoji,
            color: taskData.color,
            user: {
              connect: { id: userDb.id }
            },
            limitCounter: taskData.counter.value,
            counter: {
              create: {
                label: taskData.counter.label,
                valueNumber: taskData.counter.value,
                unit: taskData.counter.unit,
                taskMetric: {
                  create: taskData.metrics.map((m) => ({
                    emoji: m.emoji,
                    field: m.field,
                    value: m.value,
                    unit: m.unit,
                    date: null
                  }))
                }
              }
            },
            // 📂 CATEGORY com Conexão Inteligente
            ...(taskData.category && {
              categories: {
                connectOrCreate: [
                  {
                    where: {
                      // 🎯 Busca pela combinação ÚNICA de Usuário + Nome da Categoria
                      userId_name: {
                        name: taskData.category.name,
                        userId: userDb.id,
                      },
                    },
                    create: {
                      name: taskData.category.name,
                      emoji: taskData.category.emoji ?? null,
                      color: taskData.category.color ?? null,
                      userId: userDb.id, // Obrigatório para o registro pertencer ao usuário
                    },
                  },
                ],
              },
            }),

            // 🎯 GOAL com Conexão Inteligente
            ...(taskData.goal && {
              goals: {
                connectOrCreate: [
                  {
                    where: {
                      userId_name: {
                        name: taskData.goal.name,
                        userId: userDb.id,
                      },
                    },
                    create: {
                      name: taskData.goal.name,
                      emoji: taskData.goal.emoji ?? null,
                      userId: userDb.id,
                    },
                  },
                ],
              },
            }),
          }
        });
      })
    );

    console.log(`✅ ${createdTasks.length} tarefas criadas com sucesso!`);
    return NextResponse.json(createdTasks);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create tasks" }, { status: 500 });
  }
}