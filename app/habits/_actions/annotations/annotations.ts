"use server"

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from "@/lib/prisma"

import { cloudinary } from "@/lib/cloudinary"

import z from "zod"

import {
  createAnnotationSchema,
  type CreateAnnotationSchemaType
} from "@/lib/schema/annotations"

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
          folder: "annotations",
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

export async function fetchAnnotationByCompletion(completionId: string) {
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

  const validator = z.string()
  const parsedBody = validator.safeParse(completionId)

  if(!parsedBody.success) {
    throw new Error("Error parsing data files")
  }

  return await prisma.habitCompletion.findUnique({
    where: {
      id: completionId
    },
    include: {
      annotations: true
    }
  })
}

export async function createAnnotation(form: CreateAnnotationSchemaType) {
  const parsedBody =  createAnnotationSchema.safeParse(form)

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
    name,
    completionId,
    files,
    summary
  } = parsedBody.data

  if(!parsedBody.success) {
    throw new Error("Error parsing data files")
  }

  //PROCESSAR O ARQUIVO E DETECTAR SE É VIDEO, PDF, IMAGEM, TEXTO
  console.log(files, "files")

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

  const existingAnnotation = await prisma.annotations.findFirst({
    where: {
      completion: {
        id: completionId
      }
    }
  })

  if(existingAnnotation) {
    throw new Error("already existing anottation vinculed this completion")
  }

  try {
    return await prisma.annotations.create({
      data: {
        name,
        content: "",
        summary,
        imageUrl: uploadedFiles[0].url,
        completionId
      }
    })
  } catch (error) {
    if(error instanceof Error) {
      console.log(error.message)
    }
  }

}