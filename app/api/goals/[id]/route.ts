import { prisma } from "@/lib/prisma"
import { UpdateCategorieSchema } from "@/lib/schema/categorie"
import { UpdateGoalSchema } from "@/lib/schema/goal"
import { auth } from "@clerk/nextjs/server"
import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"

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

    await prisma.goals.update({
      where: {
        id
      },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting goals:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: goalId } = await params
    const { userId } = await auth()

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })

    if (!userDb) return NextResponse.json({ error: "User not found on db" }, { status: 401 })

    const body = await request.json()
    const parsedBody = UpdateGoalSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json({ error: parsedBody.error.message }, { status: 400 })
    }
    
    const { name, emoji, description } = parsedBody.data

    const updatedGoal = await prisma.goals.update({
      where: {
        id: goalId,
        userId: userDb.id // Segurança: garante que o objetivo pertence ao usuário
      },
      data: {
        name,
        emoji,
        description,
        updatedAt: new Date()
      },
    })

    return NextResponse.json(updatedGoal)
  } catch (error) {
    // Tratamento de erro específico para "Registro não encontrado"
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json({ 
          error: "Not Found", 
          message: "O objetivo selecionado não foi encontrado para atualização." 
        }, { status: 404 })
      }
      if (error.code === "P2002") {
        return NextResponse.json({
          error: "Duplicate entry",
          message: "Você já possui um objetivo com esse nome.",
          field: "name"
        }, { status: 409 })
      }
    }
    
    console.error("Error updating goal:", error instanceof Error ? error.message : error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
