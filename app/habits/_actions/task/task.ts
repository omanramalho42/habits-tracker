"use server"

import { redirect } from "next/navigation"
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from "@/lib/prisma"

import {
  CreateTaskSchema,
  type CreateTaskSchemaType
} from "@/lib/schema/task"

import { uploadToCloudinary } from "../annotations/annotations"

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
            taskMetric: true
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