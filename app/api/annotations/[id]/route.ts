import { NextRequest, NextResponse } from "next/server"

import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { updateAnnotationSchema } from "@/lib/schema/annotations"
import { uploadToCloudinary } from "@/app/habits/_actions/annotations/annotations"

export async function GET(request: Request) {
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
    const parsedBody = updateAnnotationSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      completionId,
      name,
      files,
      summary,
      id
    } = parsedBody.data
  
    const annotation = await prisma.annotations.findUnique({
      where: {
        id
      },
    })

    return NextResponse.json(annotation)
}

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

    await prisma.annotations.delete({
      where: {
        id
      }
    })
    // await prisma.annotations.update({
    //   where: {
    //     id
    //   },
    //   data: {
    //     status: 'ARCHIVED',
    //     updatedAt: new Date()
    //   }
    // })
    
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting annotation:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
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

    const parsedBody = updateAnnotationSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      files,
      summary
    } = parsedBody.data

    const uploadedFiles = []
    
    if(files.length > 0) {
      for (const file of files) {
        if(file) {
          const uploaded = await uploadToCloudinary(file)
    
          if (uploaded) {
            uploadedFiles.push({
              url: uploaded.url,
              type: uploaded.resourceType, // image | video | raw
            })
          }
        }
      }
    }
    
    const updatedNote = await prisma.annotations.update({
      where: {
        id,
        userId: userDb.id
      },
      data: {
        name,
        summary,
        imageUrl: uploadedFiles.length > 0 ? uploadedFiles[0].url : "",
        updatedAt: new Date()
      },
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating annotation:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
