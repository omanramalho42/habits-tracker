import { auth } from "@clerk/nextjs/server"

import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { createFeedbackSchema } from "@/lib/schema/feedback"
import { uploadToCloudinary } from "@/app/habits/_actions/annotations/annotations"

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
    
    const feedbacks = await prisma.feedback.findMany({
      // where: {
      //   userId: userDb.id,
      // },
      include: {
        user: {
          include: {
            settings: true
          }
        }
      },
      orderBy: {
        createdAt: "asc",
      }
    })

    return NextResponse.json(feedbacks)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching feedbacks:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedBody = createFeedbackSchema.safeParse(body)
  
    if(!parsedBody.success) {
      throw new Error(parsedBody.error.message)
    }
    
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

    const {
      description,
      title,
      type,
      files,
      page,
      rating
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

    const feedback = await prisma.feedback.create({
      data: {
        userId: userDb.id,
        title,
        type,
        page,
        rating,
        imageUrl: uploadedFiles.length > 0 ? uploadedFiles[0].url : "",
        description: description || "",
      }
    })
    return NextResponse.json(feedback)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error posting feedback:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}