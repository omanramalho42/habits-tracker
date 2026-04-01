import { type NextRequest, NextResponse } from "next/server"

import z from "zod"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { UpdateTaskSchema } from "@/lib/schema/task"
import { getTodayString } from "@/lib/habit-utils"
import { uploadToCloudinary } from "../route"
import { log } from "@/lib/utils"
import { TaskMetric } from "@prisma/client"

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

    // await prisma.task.delete({
    //   where: {
    //     id,
    //     userId: userDb.id
    //   }, include: {
    //     schedules:  true
    //   }
    // })
    const updatedTask = await prisma.task.update({
      where: {
        id,
        userId: userDb.id
      },
      data: {
        status: 'ARCHIVED',
        updatedAt: new Date()
      }
    })


    await prisma.$transaction([
      prisma.taskSchedule.deleteMany({
        where: {
          taskId: updatedTask.id,
        }
      }),
      prisma.task.update({
        where: {
          id,
          userId: userDb.id
        },
        data: {
          status: 'ARCHIVED',
          updatedAt: new Date()
        }
      })
    ])
  
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting task:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const body = await request.json()

    const parsedBody = UpdateTaskSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      limitCounter,
      goals,
      categories,
      color,
      counter,
      counterId,
      custom_field,
      description,
      status,
      isPLus,
      imageUrl,
      videoUrl
    } = parsedBody.data

    console.log(parsedBody.data, "parsedBody.data")

    // ✅ IMAGE
    let imageUrlUploaded: string | null = imageUrl

    if (imageUrl && imageUrl instanceof File) {
      const uploaded = await uploadToCloudinary(imageUrl)

      if (uploaded) {
        imageUrlUploaded = uploaded.url
      }
    }

    // ✅ VIDEO
    let videoUrlUploaded: string | null = videoUrl

    if (videoUrl && videoUrl instanceof File) {
      const uploaded = await uploadToCloudinary(videoUrl)

      if (uploaded) {
        videoUrlUploaded = uploaded.url
      }
    }

    const existingGoal = await prisma.goals.findFirst({
      where: {
        id: goals
      }
    })

    if(existingGoal) {
      await prisma.task.update({
        where: {
          id,
          userId: userDb.id
        },
        data: {
          goals: {
            disconnect: {
              id: existingGoal.id
            }
          }
        }
      })
    }

    const existingCategorie = await prisma.categories.findFirst({
      where: {
        id: categories
      }
    })

    if(existingCategorie) {
      await prisma.task.update({
        where: {
          id,
          userId: userDb.id
        },
        data: {
          categories: {
            disconnect: {
              id: existingCategorie.id
            }
          }
        }
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updatedTask = await prisma.task.update({
      where: {
        id
      },
      data: {
        userId: userDb.id,
        name,
        emoji,
        limitCounter,
        ...(counterId && ( {
          counterId: counterId!
        } )),
        color,
        description,
        ...(imageUrlUploaded && { imageUrl: imageUrlUploaded }),
        ...(videoUrlUploaded && { videoUrl: videoUrlUploaded }),
        updatedAt: today,
        ...(goals  && {goals: {
          connect: {
            id: goals
          }
        }}),
        ...(categories  && {categories: {
          connect: {
            id: categories
          }
        }})
      },
      include: {
        completions: true,
      },
    })

    console.log(updatedTask, "updated task")

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating task:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    log("START", { taskId: id })
    
    const { userId } = await auth()
    log("AUTH USER", { userId })
  

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
    log("USER DB", userDb)
    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }

    const body = await request.json()
    const date = body?.date ?? getTodayString()
    
    const validator = z.string()
    const bodyParams = validator.safeParse(date)
    
    if (!bodyParams.success) {
      throw new Error("Invalid date format")
    }
    const newDate =
      bodyParams.data
    const completedDate = new Date(newDate)

    log("DATE RECEIVED", body?.date)
    log("PARSED DATE", completedDate)

    // 1️⃣ Busca a completion do dia
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_completedDate: {
          taskId: id,
          completedDate,
        },
      },
      include: {
        counter: {
          include: {
            taskMetric: true,
          },
        },
      },
    })

    log("EXISTING COMPLETION", existingCompletion)
    // 2️⃣ NÃO EXISTE → cria
    if (!existingCompletion) {
      log("FLOW", "CREATE NEW COMPLETION")
      const result = await prisma.$transaction(async (tx) => {
        const task = await tx.task.findUnique({
          where: {
            id,
            userId: userDb.id,
            status: "ACTIVE",
          },
          include: {
            counter: {
              include: {
                taskMetric: true, // templates
              },
            },
          },
        })

        if (!task || !task.counter) {
          throw new Error("Task or Counter not found")
        }

        const counter = task.counter

        const currentValue = counter.valueNumber ?? 0
        const nextValue = currentValue + 1

        const isCompleted = nextValue >= counter.limit
        log("TASK FOUND", task)

        log("COUNTER STATE", {
          currentValue,
          nextValue,
          limit: counter.limit,
        })

        log("IS COMPLETED?", isCompleted)
        // 1️⃣ cria completion
        const completion = await tx.taskCompletion.create({
          data: {
            taskId: id,
            counterId: counter.id,
            completedDate,
            isCompleted,
          },
        })
        
        // 2️⃣ clona métricas (snapshot)
        const baseMetrics = counter.taskMetric.filter(
          (m) => !m.completionId
        )

        await tx.taskMetric.updateMany({
          where: {
            counterId: counter.id,
            completionId: null,
          },
          data: {
            completionId: completion.id,
            // index: String(nextValue),
            // isComplete: false,
            // date: new Date(),
          },
        })
        log("BASE METRICS", baseMetrics)
        log("CREATING METRICS SNAPSHOT", {
          step: nextValue,
          total: baseMetrics.length,
        })
        // 3️⃣ atualiza counter global
        // await tx.counter.update({
        //   where: { id: counter.id },
        //   data: {
        //     valueNumber: nextValue,
        //   },
        // })
        log("UPDATING COUNTER", {
          old: currentValue,
          new: nextValue,
        })
        log("CREATION RESULT", {
          completionId: completion.id,
          nextValue,
          isCompleted,
        })
        return {
          completion,
          nextValue,
          isCompleted,
          limit: counter.limit,
        }
        
      })
      return NextResponse.json({
        completion: result.completion,
        completed: result.isCompleted,
        progress: `${result.nextValue}/${result.limit}`,
        value: result.nextValue,
      })
    }
    log("FLOW", "UPDATE EXISTING COMPLETION")
    // 3️⃣ EXISTE e NÃO TEM contador → toggle normal
    if (!existingCompletion.counter) {
      await prisma.taskCompletion.delete({
        where: {
          id: existingCompletion.id,
        },
      })

      return NextResponse.json({
        completed: false
      })
    }

    // 4️⃣ EXISTE e TEM contador
    const currentCounter = existingCompletion.counter.valueNumber ?? 0
    const limitCounter = existingCompletion.counter.limit ?? 1

    console.log(currentCounter, limitCounter, "current x limit counter")

    // 4.1️⃣ Ainda não chegou no limite → incrementa
    if (currentCounter < limitCounter) {
      const result = await prisma.$transaction(async (tx) => {
        const counter = existingCompletion.counter

        const currentValue = counter.valueNumber ?? 0
        const nextValue = currentValue + 1

        const isCompleted = nextValue >= counter.limit
        log("INCREMENT STEP", {
          currentValue,
          nextValue,
        })
        log("FETCHING BASE METRICS")
        // 1️⃣ cria NOVAS métricas (novo step)
        const baseMetrics = await tx.taskMetric.findMany({
          where: {
            counterId: counter.id,
            completionId: null,
          },
        })
        log("NEW METRICS SNAPSHOT", {
          step: nextValue,
          metricsCount: baseMetrics.length,
        })
        if (baseMetrics.length > 0) {
          await tx.taskMetric.createMany({
            data: baseMetrics.map((metric) => ({
              emoji: metric.emoji,
              fieldType: metric.fieldType,
              field: metric.field,
              unit: metric.unit,

              // value: metric.value,
              limit: metric.limit,

              index: String(nextValue),

              counterId: counter.id,
              completionId: existingCompletion.id,

              isComplete: false,
              date: new Date(),
            })),
          })
        }

        // 2️⃣ atualiza counter
        // await tx.counter.update({
        //   where: { id: counter.id },
        //   data: {
        //     valueNumber: nextValue,
        //   },
        // })

        // 3️⃣ atualiza completion
        const updatedCompletion = await tx.taskCompletion.update({
          where: { id: existingCompletion.id },
          data: {
            isCompleted,
          },
        })
        log("UPDATED COMPLETION", updatedCompletion)
        return {
          updatedCompletion,
          nextValue,
          isCompleted,
          limit: counter.limit,
        }
      })

      log("LIMIT REACHED - NO ACTION", {
        currentCounter,
        limitCounter,
      })
      return NextResponse.json({
        completion: result.updatedCompletion,
        completed: result.isCompleted,
        progress: `${result.nextValue}/${result.limit}`,
        value: result.nextValue,
      })
    }

    // // 4.2️⃣ Chegou no limite → reset
    await prisma.taskCompletion.update({
      where: {
        id: existingCompletion.id,
      },
      data: {
        isCompleted: !existingCompletion.isCompleted,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      completion: existingCompletion,
      completed: false,
      counter: 0,
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error toggling task completion:", error.message)
      console.error("❌ ERROR TOGGLING TASK", {
        message: error.message,
        stack: error.stack,
      })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
