import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma" // Certifique-se de que o caminho do seu client prisma está correto
import { auth } from "@clerk/nextjs/server"

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

    const assistants = await prisma.assistant.findMany({
      where: {
        userId: userDb.id
      },
      select: {
        id: true,
        name: true,
        prompt: true,
        emoji: true, // Aqui assume-se que 'emoji' é um campo JSON ou Relacional
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(assistants)
  } catch (error) {
    console.error("[ASSISTANTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}