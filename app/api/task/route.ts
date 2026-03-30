import { cloudinary } from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"
import { CreateTaskSchema } from "@/lib/schema/task"
import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const authData = await auth();
    // console.log("Auth Data:", authData); // Verifique se há alguma mensagem de erro no terminal
    // Isso vai imprimir no seu terminal o motivo técnico (ex: "token expired", "invalid signature")
    // console.log("DEBUG CLERK:", authData.debug());
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
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        completions: true,
        categories: {
          where: {
            status: 'ACTIVE'
          }
        },
        goals: {
          where: {
            status: "ACTIVE"
          }
        },
        schedules: true,
        counter: {
          include: {
            taskMetric: true
          }
        }
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

export async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    return new Promise<{
      url: string
      resourceType: string
    }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "tasks",
          resource_type: "auto", // 👈 detecta imagem / vídeo / pdf
        },
        (error, result) => {
          if (error || !result) {
            return reject(error)
          }
  
          resolve({
            url: result.secure_url,
            resourceType: result.resource_type,
          })
        }
      ).end(buffer)
    })
  } catch (error) {
    if(error instanceof Error) {
      throw new Error(error.message)
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

    const parsedBody = CreateTaskSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      limitCounter,
      custom_field,
      goals,
      counterId,
      categories,
      imageUrl,
      videoUrl,
      color,
      description,
      isPLus
    } = parsedBody.data

    // console.log(parsedBody.data, "data")

    const newTask = await prisma.task.create({
      data: {
        userId: userDb.id,
        emoji,
        name,
        ...(counterId && ( {
          counterId: counterId!
        } )),
        // cronId,
        // frequencyId,
        customField: custom_field,
        limitCounter: Number(limitCounter) || 1,
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
        counter: {
          include: {
            taskMetric: true
          }
        },
      },
    })

    return NextResponse.json(newTask)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error create task:", error)
      return NextResponse.json({
        error: "Failed to create new task"
      }, { status: 500 })
    }
  }
}