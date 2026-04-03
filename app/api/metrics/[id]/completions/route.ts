import { NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"
import { useAuth } from "@clerk/nextjs"

import z from "zod"

import { prisma } from "@/lib/prisma"
import {
  createMetricCompletionsSchema,
  updateMetricCompletionsSchema
} from "@/lib/schema/metrics-completions"

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

    const completion = await prisma.taskMetricCompletion.delete({
      where: {
        id,
      },
    })

    return NextResponse.json(
      completion,
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting metric completion:", error.message)
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

    const taskMetricCompletion =
      await prisma.taskMetricCompletion.findUnique({
        where: {
          id,
        }
      })
    
    return NextResponse.json(
      taskMetricCompletion,
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.name, "error GET taskMetricCompletion", error.message)
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
      updateMetricCompletionsSchema
    ).safeParse(bodyParams)

    if (!validator.success) {
      throw new Error(validator.error.message)
    }

    const completions = validator.data

    const completionsMetrics = Promise.all(completions.map( async ({
      id,
      step,
      taskMetricId,
      date,
      isComplete,
      value
    }) => {
      await prisma.taskMetricCompletion.upsert({
        where: {
          id
        },
        create: {
          taskMetricId,
          isComplete,
          step,
          value,
          date,
        },
        update: {
          step,
          value,
          date,
        }
      }) 
    }))

    return NextResponse.json(
      completionsMetrics,
      { status: 201 }
    )
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
      createMetricCompletionsSchema
    ).safeParse(bodyParams)

    if (!validator.success) {
      throw new Error(validator.error.message)
    }

    const taskMetric = validator.data

    await prisma.taskMetricCompletion.createMany({
      data: taskMetric
    })

    return NextResponse.json(
      taskMetric,
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message, "error POST metrics")
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}