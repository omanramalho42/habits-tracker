import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import { CreateCategorieSchema } from "@/lib/schema/categorie"

export async function GET(request: Request) {
  try {
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
    
    const goals = await prisma.goals.findMany({
      where: {
        userId: userDb.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        habits: true,
        checkpoints: true
      }
    })

    return NextResponse.json(goals)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching goals:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json()

    const parsedBody = CreateCategorieSchema.safeParse(body)
  
    if(!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
    
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

    const {
      name,
      description,
      emoji,
    } = parsedBody.data
  
    return await prisma.categories.create({
      data: {
        name,
        userId: userDb.id,
        description: description || "",
        emoji: emoji || "",
      }
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error posting categories:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}