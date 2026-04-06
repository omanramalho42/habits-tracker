import { type NextRequest, NextResponse } from "next/server"

import z from "zod"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { UpdateTaskSchema } from "@/lib/schema/task"
import { uploadToCloudinary } from "../route"

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;

    const { userId } = await auth()

    if (!userId) return NextResponse.json({
      error: "Unauthorized"
    }, { status: 401 });

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })
    if (!userDb) return NextResponse.json({
      error: "User not found"
    }, { status: 401 })

    const body = await request.json()
    const date = body?.date 
      ? new Date(body.date) 
      : new Date()
    date.setHours(0, 0, 0, 0) // padroniza início do dia
    // 1. Tenta encontrar a conclusão existente
    const existingCompletion = await prisma.taskCompletion.findUnique({
      where: {
        taskId_completedDate: {
          taskId,
          completedDate: date
        }
      }
    })
    console.log(existingCompletion, "exist completion ⚠️")
    // 2. Executa o upsert com a lógica de inversão
    const completion = await prisma.taskCompletion.upsert({
      where: {
        taskId_completedDate: { taskId, completedDate: date }
      },
      create: {
        taskId,
        completedDate: date,
        isCompleted: true // Se está criando agora, assume-se que o usuário clicou para completar
      },
      update: {
        // Inverte o valor baseado no que encontramos anteriormente
        isCompleted:
          existingCompletion 
          ? !existingCompletion.isCompleted 
          : true,
        updatedAt: new Date(),
      },
      include: {
        counterStep: true,
        task: {
          include: {
            counter: true
          }
        }
      },
    });
    console.log(completion ,"completion after updated ⏳");
    // const counter = completion.task.counter;
    // if (!counter) throw new Error("Counter not found")

    // // 2️⃣ Cria ou atualiza CounterStep
    // const counterStep = await prisma.counterStep.upsert({
    //   where: {
    //     counterId_date_completionId: {
    //       counterId: counter.id,
    //       date,
    //       completionId: completion.id,
    //     },
    //   },
    //   create: {
    //     counterId: counter.id,
    //     date,
    //     completionId: completion.id,
    //     currentStep: 0,
    //     limit: counter.limit,
    //   },
    //   update: {
    //     updatedAt: new Date(),
    //     limit: counter.limit,
    //   },
    // })

    // if (counterStep.currentStep >= counterStep.limit) {
    //   throw new Error("Daily counter limit reached")
    // }

    // const nextStep = counterStep.currentStep + 1

    // // 3️⃣ Atualiza CounterStep com novo step
    // await prisma.counterStep.update({
    //   where: { id: counterStep.id },
    //   data: { currentStep: nextStep },
    // })

    // // 4️⃣ Atualiza valor total do Counter
    // await prisma.counter.update({
    //   where: { id: counter.id },
    //   data: { valueNumber: nextStep },
    // })

    // // 5️⃣ Cria TaskMetricCompletion para cada métrica do Counter
    // const metrics = await prisma.taskMetric.findMany({
    //   where: {
    //     taskId,
    //     status: "ACTIVE"
    //   },
    // })

    // await Promise.all(
    //   metrics.map((metric) =>
    //     prisma.taskMetricCompletion.create({
    //       data: {
    //         taskMetricId: metric.id,
    //         completionId: completion.id,
    //         step: nextStep,
    //         value: "",
    //         isComplete: false,
    //         date,
    //       },
    //     })
    //   )
    // )

    return NextResponse.json(completion)
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error toggling task completion:", error.message);
      return NextResponse.json({
        error: error.message
      }, { status: 500 });
    }
  }
}