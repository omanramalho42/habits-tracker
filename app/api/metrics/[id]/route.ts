import { NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"
import { useAuth } from "@clerk/nextjs"

import z from "zod"

import { prisma } from "@/lib/prisma"
import { CreateMetricSchema, UpdateMetricSchema } from "@/lib/schema/metrics"

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

    await prisma.taskMetric.update({
      where: {
        id,
      },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting metric:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const { userId } = await auth()

    if(!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userDb = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      }
    })

    if(!userDb) {
      return NextResponse.json(
        { error: "User not find on db" },
        { status: 401 }
      )
    }

    const taskMetric =
      await prisma.taskMetric.findUnique({
        where: {
          id,
          status: 'ACTIVE',
        }
      })
    
    return NextResponse.json({
      success: true,
      data: taskMetric
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, "error GET metrics", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function PATCH(request: NextRequest, response: NextResponse) {
  try {
    const { userId } = await useAuth()

    if(!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userDb = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      }
    })

    if(!userDb) {
      return NextResponse.json(
        { error: "User not find on db" },
        { status: 401 }
      )
    }

    const bodyParams = await request.json()
    const validator = z.array(
      UpdateMetricSchema
    ).safeParse(bodyParams)

    if (!validator.success) {
      throw new Error(validator.error.message)
    }

    const metrics = validator.data

    Promise.all(metrics.map( async ({
      field,
      limit,
      unit,
      emoji,
      id,
      fieldType,
      isComplete,
      step,
      value
    }) => {
      await prisma.taskMetric.upsert({
        where: {
          id
        },
        create: {
          emoji,
          field,
          limit,
          unit,
          //⚠️
          fieldType: 'NUMERIC',
        },
        update: {

        }
      }) 
    }))

    return NextResponse.json({
      success: true
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message, "error PATCH metrics")
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const { userId } = await useAuth()

    if(!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userDb = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      }
    })

    if(!userDb) {
      return NextResponse.json(
        { error: "User not find on db" },
        { status: 401 }
      )
    }

    const bodyParams = await request.json()
    const validator = z.array(
      CreateMetricSchema
    ).safeParse(bodyParams)

    if (!validator.success) {
      throw new Error(validator.error.message)
    }

    const taskMetric = validator.data

    await prisma.taskMetric.createMany({
      data: taskMetric
    })

    return NextResponse.json({
      success: true
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message, "error POST metrics")
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}