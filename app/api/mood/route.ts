import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

import type { MoodEntry } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json()
    const {
      mood_type,
      mood_level,
      entry_date
    } = body

    const newEntryMood = await prisma.moodEntry.create({
      data: {
        moodType: mood_type,
        moodLevel: mood_level,
        entryDate: new Date(entry_date)
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
