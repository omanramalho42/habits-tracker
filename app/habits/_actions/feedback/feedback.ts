"use server"

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from "@/lib/prisma"

import { cloudinary } from "@/lib/cloudinary"
import { createFeedbackSchema, CreateFeedbackSchemaType } from "@/lib/schema/feedback"

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
          folder: "feedbacks",
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

export async function createFeedback(form: CreateFeedbackSchemaType) {
  const parsedBody =  createFeedbackSchema.safeParse(form)

  if (!parsedBody.success) throw new Error(parsedBody.error.message)

  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // VERIFICAR SE O USUARIO EXISTE NO BD
  const userDb = await prisma.user.findFirst({
    where: {
      clerkUserId: user.id,
    },
  })

  if (!userDb) {
    throw new Error("User not found")
  }

  const {
    description,
    title,
    type,
    files,
    page,
    rating
  } = parsedBody.data

  if(!parsedBody.success) {
    throw new Error("Error parsing data files")
  }

  const uploadedFiles = []
  for (const file of files) {
    const uploaded = await uploadToCloudinary(file)

    if (uploaded) {
      uploadedFiles.push({
        url: uploaded.url,
        type: uploaded.resourceType, // image | video | raw
      })
    }
  }

  try {
    return await prisma.feedback.create({
      data: {
        title,
        description,
        type,
        page,
        rating,
        imageUrl: uploadedFiles[0] && uploadedFiles[0].url,
        userId: userDb.id,
      }
    })
  } catch (error) {
    if(error instanceof Error) {
      console.log(error.message)
    }
  }
}