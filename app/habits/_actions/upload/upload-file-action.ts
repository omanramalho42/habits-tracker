"use server"

import { cloudinary } from "@/lib/cloudinary"

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