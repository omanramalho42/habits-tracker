import { NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"
import { createCounterStepSchema } from "@/lib/schema/counter-step"

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

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    //⚠️
    const counterSteps = await prisma.counterStep.findMany({
      where: {
        date: today
      }
    })

    return NextResponse.json(
      counterSteps,
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching counter steps:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedBody = createCounterStepSchema.safeParse(body)
    
    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
  
    const {
      completionId,
      counterId,
      date,
      limit,
      currentStep
    } = parsedBody.data
    
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json(
        { error: "user not find on db" },
        { status: 401 }
      )
    }
    
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ cria counter step
      return await tx.counterStep.create({
        data: {
          date,
          limit,
          completionId,
          currentStep,
          counterId,
        }
      })
    })

    return NextResponse.json(result)

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error posting counter step:", error.message)

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
  }
}