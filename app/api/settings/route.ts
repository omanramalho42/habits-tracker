import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { NextResponse } from "next/server"

import { updateUserSettingSchema } from "@/lib/schema/user-settings"

export async function GET() {
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
  
    const userSettings =
      await prisma.userSettings.findUnique({
      where: {
        userId: userDb.id
      }
    })
  
    return NextResponse.json(userSettings)
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const user = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if(!user) {
      return NextResponse.json({
        error: "Error find user on db"
      }, { status: 400 })
    }

    const parsedBody = updateUserSettingSchema.safeParse(request.body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)

    const {
      name,
      email,
      phone,
      avatarUrl,
      bannerUrl,
      theme,
      emailNotifications,
      smsNotifications,
      allow_notifications,
      isTravelling
    } = parsedBody.data

    // console.log(parsedBody.data, "data!")

    //CLOUDINARY PARA PROCESSAR IMAGEM AVATAR

    //CLOUDINARY PARA PROCESSAR IMAGEM DE BANNER

    const existUserSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id
      }
    })

    if(!existUserSettings) {
      const updated = await prisma.userSettings.create({
        data: {
          phone,
          email: email,
          notificationsEnabled: allow_notifications,
          emailNotifications,
          smsNotifications,
          userId: user.id,
        }
      })

      return NextResponse.json(updated)
    } else {
      const updated = await prisma.userSettings.update({
        where: {
          userId: existUserSettings.userId
        },
        data: {
          phone,
          email,
          notificationsEnabled: allow_notifications,
          emailNotifications,
          smsNotifications,
        }
      })

      // console.log(updated, "updated user settings")
      return NextResponse.json(updated)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      NextResponse.json({ error: error.message}, { status: 500 })
    }   
  }
}
