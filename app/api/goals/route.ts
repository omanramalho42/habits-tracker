import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import { CreateCategorieSchema } from "@/lib/schema/categorie"
import { Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })

    if (!userDb) return NextResponse.json({ error: "User not found" }, { status: 401 })

    // Construção robusta da cláusula WHERE
    const whereClause: any = { 
      userId: userDb.id,
      status: "ACTIVE" 
    }

    if (query && query !== "all") {
      whereClause.AND = [
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        }
      ]
    }

    const goals = await prisma.goals.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" }
    })

    return NextResponse.json(goals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedBody = CreateCategorieSchema.safeParse(body)
  
    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
    
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not found"
      }, { status: 401 })
    }

    const { name, description, emoji } = parsedBody.data

    // ✅ cria objetivo
    await prisma.goals.create({
      data: {
        name,
        userId: userDb.id,
        description: description || "",
        emoji: emoji || "",
      }
    })

    // 🔥 BUSCA DADOS ATUALIZADOS

    const now = new Date()
    const startOfWeek = new Date()
    startOfWeek.setDate(now.getDate() - 7)

    const [totalGoals, weeklyGoals, goals] = await Promise.all([
      prisma.goals.count({
        where: { userId: userDb.id }
      }),

      prisma.goals.count({
        where: {
          userId: userDb.id,
          createdAt: {
            gte: startOfWeek
          }
        }
      }),

      prisma.goals.findMany({
        where: { userId: userDb.id },
        take: 3, // 👈 só preview
        orderBy: { createdAt: "desc" }
      })
    ])

    // 🎨 Mapeia cores e ícones (pode evoluir depois)
    const colors = ["#FBBF24", "#A855F7", "#22C55E", "#3B82F6"]

    const goalsPreview = goals.map((goal, index) => ({
      progress: Math.floor(Math.random() * 100), // 🔥 depois você liga com tasks reais
      color: colors[index % colors.length],
      icon: goal.emoji || "🎯"
    }))

    return NextResponse.json({
      totalGoals,
      weeklyIncrease: weeklyGoals,
      goalsPreview,
      remainingCount: totalGoals - goalsPreview.length
    })

  } catch (error: any) {
    console.error("🔥 ERROR RAW:", error)

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({
        error: "Duplicate entry",
        message: "Você já possui um objetivo com esse nome.",
        field: "name"
      }, { status: 409 })
    }
    
    if (
      error?.code === "P2002" ||
      error?.message?.includes("Unique constraint failed")
    ) {
      return NextResponse.json({
        error: "Duplicate entry",
        message: "Você já possui um objetivo com esse nome.",
        field: "name"
      }, { status: 409 })
    }

    return NextResponse.json({
      error: "Internal server error",
      message: "Algo deu errado ao criar o objetivo."
    }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, name, description, emoji } = body
    
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not found"
      }, { status: 401 })
    }
    
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    }
    const goal = await prisma.goals.findFirst({
      where: {
        id,
        userId: userDb.id
      }
    })

    if (!goal) {
      return NextResponse.json({ error: "Goal não encontrado" }, { status: 404 })
    }
    const updatedGoal = await prisma.goals.update({
      where: { id },
      data: {
        name,
        description,
        emoji
      }
    })

    return NextResponse.json(updatedGoal)

  } catch (error: any) {
    console.error(error)

    return NextResponse.json({
      error: "Erro ao atualizar goal",
      details: error.message
    }, { status: 500 })
  }
}