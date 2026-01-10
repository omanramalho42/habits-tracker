import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: userId
      },
      update: {},
      create: {
        userId: userId
      }
    })
  
    return NextResponse.json(userSettings)
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      NextResponse.json({ error: error.message}, { status: 500 })
    }
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      notifications_enabled,
      email_notifications,
      sms_notifications,
      email,
      phone
    } = await request.json()

    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        notificationsEnabled: notifications_enabled,
        emailNotifications: email_notifications,
        smsNotifications: sms_notifications,
        email,
        phone,
      },
      create: {
        userId,
        notificationsEnabled: notifications_enabled ?? true,
        emailNotifications: email_notifications ?? true,
        smsNotifications: sms_notifications ?? false,
        email,
        phone,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      NextResponse.json({ error: error.message}, { status: 500 })
    }   
  }
}
