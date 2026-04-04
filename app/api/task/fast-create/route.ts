import { prisma } from "@/lib/prisma"
import { FastCreateSchema } from "@/lib/schema/task";
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = 'force-dynamic';
// 2. ROTA GET - Mock de sugestões aprimorado
export async function GET() {
  const mockedTasks = [
    {
      name: "Alimentação Limpa",
      description: "Comer salada e proteína",
      emoji: "🥗",
      color: "#3b82f6",
      counter: { label: "Dia", valueNumber: 1, unit: "x" },
      category: { name: "Saúde", emoji: "🍱", color: "#3b82f6" },
      metrics: [
        { emoji: "🥗", field: "Refeições", unit: "NUMERIC", fieldType: "NUMERIC" }
      ]
    },
    {
      name: "Beber Água",
      description: "Manter a hidratação diária",
      emoji: "💧",
      color: "#3b82f6",
      counter: { label: "Copos", valueNumber: 8, unit: "un" },
      category: { name: "Saúde", emoji: "🏥", color: "#3b82f6" },
      metrics: [
        { emoji: "💧", field: "Quantidade", unit: "ml", fieldType: "NUMERIC" }
      ]
    },
    {
      name: "Trabalho Focado",
      description: "2 horas de trabalho profundo",
      emoji: "💻",
      color: "#6366f1",
      counter: { label: "Horas", valueNumber: 2, unit: "h" },
      category: { name: "Produtividade", emoji: "📑", color: "#6366f1" },
      metrics: [
        { emoji: "⏱️", field: "Foco", unit: "min", fieldType: "NUMERIC" }
      ]
    },
    {
      name: "Treino",
      description: "Treinar pernas",
      emoji: "🏋️",
      color: "#a855f7",
      counter: { label: "Treino", valueNumber: 1, unit: "un" },
      category: { name: "Fitness", emoji: "✨", color: "#a855f7" },
      metrics: [
        { emoji: "🔥", field: "Calorias", unit: "kcal", fieldType: "NUMERIC" }
      ]
    },
    {
      name: "Dormir Cedo",
      description: "Deitar às 22:30",
      emoji: "⏰",
      color: "#3b82f6",
      counter: { label: "Horas", valueNumber: 8, unit: "h" },
      category: { name: "Saúde", emoji: "🏥", color: "#3b82f6" },
      metrics: [
        { emoji: "💤", field: "Qualidade", unit: "pt", fieldType: "NUMERIC" }
      ]
    },
    {
      name: "Leitura",
      description: "Ler um livro antes de dormir",
      emoji: "📚",
      color: "#ec4899",
      counter: { label: "Páginas", valueNumber: 20, unit: "pag" },
      category: { name: "Educação", emoji: "📖", color: "#ec4899" },
      metrics: [
        { emoji: "📖", field: "Progresso", unit: "NUMERIC", fieldType: "NUMERIC" }
      ]
    }
  ];

  return NextResponse.json(mockedTasks);
}

// 3. ROTA POST - Criação em massa
export async function POST(request: NextRequest) {
  try {
    const { userId: authId } = await auth();
    if (!authId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const body = await request.json();
    const parsed = FastCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { targetEmail, tasks } = parsed.data;

    // Localizar o usuário alvo pelo e-mail
    const targetUser = await prisma.user.findFirst({ 
      where: { email: targetEmail } 
    });

    if (!targetUser) {
      return NextResponse.json({
        error: "Usuário destino não encontrado"
      }, { status: 404 });
    }

    const results = await Promise.all(
      tasks.map(async (t) => {
        return prisma.task.create({
          data: {
            name: t.name,
            description: t.description ?? null,
            emoji: t.emoji ?? null,
            color: t.color ?? null,
            userId: targetUser.id,
            limitCounter: Math.floor(t.counter.valueNumber),

            // Relacionamento 1:1 com Counter
            // counter: {
            //   create: {
            //     label: t.counter.label,
            //     valueNumber: t.counter.valueNumber,
            //     unit: t.counter.unit ?? null,
            //     limit: Math.floor(t.counter.valueNumber),
            //     userId: targetUser.id,
            //   }
            // },

            // Relacionamento 1:N com TaskMetric
            metrics: {
              create: t.metrics.map(m => ({
                emoji: m.emoji ?? null,
                field: m.field ?? null,
                unit: m.unit ?? null,
                fieldType: m.fieldType,
              }))
            },

            // Relacionamento N:N com Categories
            ...(t.category && {
              categories: {
                connectOrCreate: [
                  {
                    where: { 
                      userId_name: { 
                        name: t.category.name, 
                        userId: targetUser.id 
                      } 
                    },
                    create: {
                      name: t.category.name,
                      emoji: t.category.emoji ?? null,
                      color: t.category.color ?? null,
                      userId: targetUser.id
                    }
                  }
                ]
              }
            }),

            // Relacionamento N:N com Goals
            ...(t.goal && {
              goals: {
                connectOrCreate: [
                  {
                    where: { 
                      userId_name: { 
                        name: t.goal.name, 
                        userId: targetUser.id 
                      } 
                    },
                    create: {
                      name: t.goal.name,
                      emoji: t.goal.emoji ?? null,
                      userId: targetUser.id
                    }
                  }
                ]
              }
            })
          }
        });
      })
    );

    return NextResponse.json({ 
      success: true, 
      count: results.length 
    });

  } catch (error) {
    console.error("ERRO_FAST_CREATE:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}