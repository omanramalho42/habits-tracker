import { prisma } from "@/lib/prisma"
import { UpdateCategorieSchema } from "@/lib/schema/categorie"
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

    await prisma.categories.update({
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
      console.error("Error deleting categorie:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: categorieId } = await params
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

    const parsedBody = UpdateCategorieSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      id,
      name,
      emoji,
      description,
    } = parsedBody.data

    const updatedCategorie = await prisma.categories.update({
      where: {
        id: categorieId,
        userId: userDb.id
      },
      data: {
        name,
        emoji,
        description,
        updatedAt: new Date()
      },
    })

    return NextResponse.json(updatedCategorie)
  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === "P2002" || error?.message?.includes("Unique constraint failed")) {
        return NextResponse.json({
          error: "Duplicate entry",
          message: "Você já possui uma categoria com esse nome.",
          field: "name"
        }, { status: 409 })
      }
    }
    if (error instanceof Error) {
      console.error("Error updating categorie:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}
