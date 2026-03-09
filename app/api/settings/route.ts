import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
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
  
    const userSettings =
      await prisma.userSettings.findUnique({
      where: {
        userId: user.id
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

    const {
      name,
      email,
      allow_notifications,
      theme,
      isTravelling
    } = await request.json()

    const existUserSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id
      }
    })

    if(!existUserSettings) {
      const updated = await prisma.userSettings.create({
        data: {
          userId: user.id,
          notificationsEnabled: allow_notifications,
          email: email
          // user: {
          //   connect: {
          //     clerkUserId: user.id
          //   }
          // }
        }
      })

      return NextResponse.json(updated)
    } else {
      const updated = await prisma.userSettings.update({
        where: {
          userId: existUserSettings.userId
        },
        data: {
          notificationsEnabled: allow_notifications,
          email: email,
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
