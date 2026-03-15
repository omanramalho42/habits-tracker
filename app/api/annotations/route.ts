import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { Annotations } from "@prisma/client"
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

    const annotations = await prisma.annotations.findMany({
      where: {
        completion: {
          habit: {
            userId: userDb.id,
            status: 'ACTIVE'
          }
        }
      }
    })

    return NextResponse.json(annotations)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching annotations:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}