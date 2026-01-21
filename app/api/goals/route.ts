import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import z from "zod"

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