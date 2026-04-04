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

    const parsedBody = updateUserSettingSchema.safeParse(request.body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)

    const {
      name,
      email,
      phone,
      pixKey,
      pixKeyType,
    } = parsedBody.data

    // console.log(parsedBody.data, "data!")

    //CLOUDINARY PARA PROCESSAR IMAGEM AVATAR
    //CLOUDINARY PARA PROCESSAR IMAGEM DE BANNER
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
      },
      create: {
        userId: userDb.id,
        name,
        email,
        phone,
        pixKey,
        pixKeyType,
      },
    })

    // ✅ Enviar email SOMENTE se tiver PIX
    if (email && pixKey) {
      await sendPixSuccessEmail({
        email,
        name: name || "Usuário",
        pixKey,
        pixKeyType,
      })
    }


    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof Error) {
      console.log("error", error.message);
      NextResponse.json({ error: error.message}, { status: 500 })
    }   
  }
}
