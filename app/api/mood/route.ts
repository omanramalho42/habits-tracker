import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { MoodEntry } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const [entry] = await sql<MoodEntry[]>`
      SELECT * FROM mood_entries WHERE entry_date = ${date}
    `

    return NextResponse.json(entry || null)
  } catch (error) {
    console.error("Error fetching mood entry:", error)
    return NextResponse.json({ error: "Failed to fetch mood entry" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mood_type, mood_level, entry_date } = body

    const [entry] = await sql<MoodEntry[]>`
      INSERT INTO mood_entries (mood_type, mood_level, entry_date)
      VALUES (${mood_type}, ${mood_level}, ${entry_date})
      ON CONFLICT (entry_date) 
      DO UPDATE SET mood_type = ${mood_type}, mood_level = ${mood_level}
      RETURNING *
    `

    return NextResponse.json(entry)
  } catch (error) {
    console.error("Error saving mood entry:", error)
    return NextResponse.json({ error: "Failed to save mood entry" }, { status: 500 })
  }
}
