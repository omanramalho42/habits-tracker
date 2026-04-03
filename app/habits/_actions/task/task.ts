"use server"

import { redirect } from "next/navigation"
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma"

import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskSchemaType,
  type CreateTaskSchemaType
} from "@/lib/schema/task"

import { cloudinary } from "@/lib/cloudinary"

export async function createTask(form: CreateTaskSchemaType) {
  try {
    const parsedBody = CreateTaskSchema.safeParse(form)

    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }

    const user = await currentUser()
    if (!user) redirect('/sign-in')

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: user.id,
      },
    })

    if (!userDb) throw new Error("User not found")

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

    // ✅ IMAGE
    let imageUrlUploaded: string | null = null

    if (imageUrl && imageUrl instanceof File) {
      const uploaded = await uploadToCloudinary(imageUrl)

      if (uploaded) {
        imageUrlUploaded = uploaded.url
      }
    }

    // ✅ VIDEO
    let videoUrlUploaded: string | null = null

    if (videoUrl && videoUrl instanceof File) {
      const uploaded = await uploadToCloudinary(videoUrl)

      if (uploaded) {
        videoUrlUploaded = uploaded.url
      }
    }

    // ✅ Criação da task
    return await prisma.task.create({
      data: {
        userId: userDb.id,
        emoji,
        name,
        color,
        description,

        ...(counterId && {
          counterId
        }),

        imageUrl: imageUrlUploaded || null,
        videoUrl: videoUrlUploaded || null,

        customField: custom_field,
        limitCounter: Number(limitCounter) || 1,

        ...(goals && {
          goals: {
            connect: { id: goals }
          }
        }),

        ...(categories && {
          categories: {
            connect: { id: categories }
          }
        })

      },
      include: {
        completions: true,
        counter: {
          include: {
            CounterStep: true
          }
        },
      },
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error("createTask error:", error.message)
      throw error
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

export async function updateTask(form: UpdateTaskSchemaType) {
  try {
    const parsedBody = UpdateTaskSchema.safeParse(form)

    if (!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }

    const user = await currentUser()
    if (!user) redirect('/sign-in')

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: user.id,
      },
    })

    if (!userDb) throw new Error("User not found")

    const {
      id,
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

    // ✅ IMAGE
    let imageUrlUploaded: string | null = null

    if (imageUrl && imageUrl instanceof File) {
      const uploaded = await uploadToCloudinary(imageUrl)

      if (uploaded) {
        imageUrlUploaded = uploaded.url
      }
    }

    // ✅ VIDEO
    let videoUrlUploaded: string | null = null

    if (videoUrl && videoUrl instanceof File) {
      const uploaded = await uploadToCloudinary(videoUrl)

      if (uploaded) {
        videoUrlUploaded = uploaded.url
      }
    }

    // ✅ Criação da task
    return await prisma.task.update({
      where: {
        id,
      },
      data: {
        userId: userDb.id,
        emoji,
        name,
        color,
        description,

        ...(counterId && {
          counterId
        }),

        imageUrl: imageUrlUploaded || null,
        videoUrl: videoUrlUploaded || null,

        customField: custom_field,
        limitCounter: Number(limitCounter) || 1,

        ...(goals && {
          goals: {
            connect: { id: goals }
          }
        }),

        ...(categories && {
          categories: {
            connect: { id: categories }
          }
        })
      },
      include: {
        completions: true,
        counter: {
          include: {
            CounterStep: true
          }
        },
      },
    })

  } catch (error) {
    if (error instanceof Error) {
      console.error("updateTask error:", error.message)
      throw error
    }
  }
}