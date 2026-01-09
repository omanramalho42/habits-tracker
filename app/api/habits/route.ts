import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Habit } from "@/lib/types"

export async function GET() {
  try {
    const habits = await sql<Habit[]>`
      SELECT * FROM habits ORDER BY created_at DESC
    `

    return NextResponse.json(habits)
  } catch (error) {
    console.error("Error fetching habits:", error)
    return NextResponse.json({ error: "Failed to fetch habits" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, emoji, goal, motivation, start_date, reminder, frequency, color } = body

    const [habit] = await sql<Habit[]>`
      INSERT INTO habits (name, emoji, goal, motivation, start_date, reminder, frequency, color)
      VALUES (${name}, ${emoji}, ${goal}, ${motivation}, ${start_date}, ${reminder}, ${JSON.stringify(frequency)}, ${color})
      RETURNING *
    `

    return NextResponse.json(habit)
  } catch (error) {
    console.error("Error creating habit:", error)
    return NextResponse.json({ error: "Failed to create habit" }, { status: 500 })
  }
}
