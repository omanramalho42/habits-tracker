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

    const body = await request.json()

    const parsedBody = UpdateGoalSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      id,
      name,
      emoji,
      description,
    } = parsedBody.data

    const updatedGoal = await prisma.goals.update({
      where: {
        id: goalId,
        userId: userDb.id
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
    if(error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === "P2002" || error?.message?.includes("Unique constraint failed")) {
        return NextResponse.json({
          error: "Duplicate entry",
          message: "Você já possui um objetivo com esse nome.",
          field: "name"
        }, { status: 409 })
      }
    }
    if (error instanceof Error) {
      console.error("Error updating goal:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}
