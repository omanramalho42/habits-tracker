import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { createCounterSchema } from "@/lib/schema/counter"
import { mapType } from "@/lib/utils"

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

    const counters = await prisma.counter.findMany({
      where: {
        status: "ACTIVE",
        task: {
          // Garante que o contador tenha PELO MENOS UMA tarefa do usuário
          some: {
            userId: userDb.id
          }
        }
      },
      include: {
        taskMetric: true
      }
    })

    return NextResponse.json(
      counters
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching counters:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedBody = createCounterSchema.safeParse(body)
    
    if(!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }

    // console.log(parsedBody.data, "data")

    const {
      label,
      limit,
      emoji,
      unit,
      valueNumber,
      valueText,
      taskMetric
    } = parsedBody.data
    
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
    
    const newCounter = await prisma.counter.create({
      data: {
        label,
        emoji,
        limit,
        unit,
        taskMetric: {
          createMany: {
            data: taskMetric?.map((metric) => ({
              emoji: metric.emoji,
              field: metric.field,
              value: metric.value,
              unit: metric.unit,
              fieldType: mapType(metric.fieldType) as any, // depois vamos melhorar isso
            })) || [],
          },
        },
        // valueNumber,
        // valueText,
      },
      include: {
        taskMetric: true
      }
    })

    // console.log(newCounter, 'result')

    return NextResponse.json({
      newCounter
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error posting counter:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}