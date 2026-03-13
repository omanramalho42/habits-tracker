import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

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
    
    const tasks = await prisma.task.findMany({
      where: {
        userId: userDb.id,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        checkpoints: true
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching tasks:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}