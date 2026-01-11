import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 1️⃣ Buscar usuário interno pelo clerkUserId
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
    })

    if(!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

  
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const entry = await prisma.moodEntry.findUnique({
      where: {
        entryDate: new Date(date),
      },
    })

    return NextResponse.json(entry || null)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching mood entry:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { mood_type, mood_level, entry_date } = body

    // 1️⃣ Buscar usuário interno pelo clerkUserId
    const user = await prisma.user.findUnique({
      where: {
        id: clerkUserId
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }
    const newEntryMood = await prisma.moodEntry.create({
      data: {
        userId: user.id,
        moodType: mood_type,
        moodLevel: mood_level,
        entryDate: new Date(entry_date),
      }
    })

    return NextResponse.json(newEntryMood)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving mood entry:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}
