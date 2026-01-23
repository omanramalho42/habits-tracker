import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import { auth } from "@clerk/nextjs/server"
import z from "zod"

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
    const userDb = await prisma.user.findUnique({
      where: {
        clerkUserId: userId
      },
    })

    if(!userDb) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

    const today = new Date()
    today.setHours(0,0,0,0)

    console.log(today, 'new date')
    const entry = await prisma.moodEntry.findUnique({
      where: {
        userId: userDb.id,
        entryDate: today,
      },
    })
    console.log("mood finded")
    return NextResponse.json(entry)
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
        clerkUserId: clerkUserId
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      )
    }

    const newDate = new Date(entry_date)
    newDate.setHours(0,0,0,0)

    const entry = await prisma.moodEntry.findUnique({
      where: {
        userId: user.id,
        entryDate: newDate,
      },
    })

    if(!entry) {
      const newEntryMood = await prisma.moodEntry.create({
        data: {
          userId: user.id,
          moodType: mood_type,
          moodLevel: mood_level,
          entryDate: newDate
        }
      })
      return NextResponse.json(newEntryMood)
    }

    return NextResponse.json(
      { error: "user mood entry already created" },
      { status: 404 }
    )
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error saving mood entry:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}
