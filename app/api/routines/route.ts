import { z } from 'zod'

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { createRoutineSchema } from '@/lib/schema/routine'

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
    
    const { searchParams } = new URL(request.url)
    const paramDate = searchParams.get('selectedDate')
    
    const validator = z.string()
    const queryParams = validator.safeParse(paramDate)

    const today = queryParams.data 
      ? new Date(queryParams.data) 
      : new Date()
    today.setHours(0, 0 ,0 ,0)

    const routines = await prisma.routine.findMany({
      where: {
        userId: userDb.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        habitSchedules: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            alarms: true,
            habit: {
              include: {
                completions: {
                  where: {
                    completedDate:{
                        gte: queryParams.success 
                          ? new Date(queryParams.data) 
                          : new Date()
                      }
                  }
                }
              }
            }
          }
        },
        taskSchedules: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            task: {
              include: {
                completions: {
                  include: {
                    counterStep: true,
                  },
                  where: {
                    completedDate: {
                      gte: queryParams.success 
                        ? new Date(queryParams.data) 
                        : new Date()
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(routines)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching routines:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
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
    
    const body = await request.json()

    const parsedBody = createRoutineSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      dateRange,
      habits,
      tasks,
      cron,
      description,
      frequency
    } = parsedBody.data

    const newStartdate = new Date(dateRange.from)
      newStartdate.setHours(0,0,0,0)
    const newEnddate = 
      dateRange.to ? new Date(dateRange.to) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newRoutine = await prisma.routine.create({
      data: {
        userId: userDb.id,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        frequency,
        cron,
        name,
        description,
        ...(habits?.length && {
          habitSchedules: {
            connectOrCreate: habits.map((habitId) => ({
              where: {
                id: habitId,
                status: 'ACTIVE'
              },
              create: {
                habitId: habitId,
              }
            }))
          }
        }),
        ...(tasks?.length && {
          taskSchedules: {
            deleteMany: {},
            create: tasks?.map((taskId: string) => ({
              task: {
                connect: { id: taskId }
              }
            }))
          },
        })
      }
    })

    return NextResponse.json(newRoutine)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error routine habits:", error)
      return NextResponse.json({
        error: "Failed to create new routine"
      }, { status: 500 })
    }
  }
}