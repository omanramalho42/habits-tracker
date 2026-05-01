import { auth } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { NextResponse } from "next/server"

import { updateUserSettingSchema } from "@/lib/schema/user-settings"
import { sendPixSuccessEmail } from "@/lib/nodemailer"

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
        },
        include: {
          user: {
            include: {
              notifications: true,
              usage: true
            }
          }
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

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if(!userDb) {
      return NextResponse.json({
        error: "Error find user on db"
      }, { status: 400 })
    }
    const body = await request.json()

    const parsedBody = updateUserSettingSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)

    const {
      name,
      email,
      phone,
      pixKey,
      pixKeyType,
      preferences
    } = parsedBody.data

    const settings = await prisma.userSettings.upsert({
      where: {
        userId: userDb.id,
      },
      update: {
        name,
        email,
        phone,
        pixKey,
        pixKeyType,
        // ✅ MAPEAMENTO NOVO
        showGraphs: preferences?.showGraphs,
        habitLayout: preferences?.habitLayout,
        showOnlyGroupTasks: preferences?.showOnlyGroupTasks
      },
      create: {
        userId: userDb.id,
        name,
        email,
        phone,
        pixKey,
        pixKeyType,
        // ✅ MAPEAMENTO NOVO
        showGraphs: preferences?.showGraphs ?? true,
        habitLayout: preferences?.habitLayout ?? "VERTICAL",
        showOnlyGroupTasks: preferences?.showOnlyGroupTasks
      },
    })

    // ✅ Enviar email SOMENTE se tiver PIX
    if (email && pixKey) {
      await sendPixSuccessEmail({
        email,
        name: name || "Usuário",
        pixKey,
        pixKeyType: pixKeyType ?? "",
      })
    }

    // console.log(settings, "✨")

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }   
  }
}
