import { NextRequest, NextResponse } from "next/server"

import { useAuth } from "@clerk/nextjs"

import z from "zod"

import { prisma } from "@/lib/prisma"
import { CreateMetricSchema, UpdateMetricSchema } from "@/lib/schema/metrics"
import { auth } from "@clerk/nextjs/server"
import { mapType } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
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

    const taskMetrics =
      await prisma.taskMetric.findMany({
        where: {
          status: 'ACTIVE',
          task: {
            userId: userDb.id,
            status: 'ACTIVE'
          }
        }
      })
    
    return NextResponse.json({
      success: true,
      data: taskMetrics
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

    const taskMetrics = validator.data

    await prisma.taskMetric.createMany({
      data: taskMetrics.map(metric => ({
        ...metric,
        fieldType: mapType(metric.fieldType) // Cast to match Prisma's MetricType
      }))
    })

    return NextResponse.json({
      success: true
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message, "error POST task metrics")
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}