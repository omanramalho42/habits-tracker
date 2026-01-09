import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getTodayString } from "@/lib/habit-utils"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const date = body.date || getTodayString()

    // Check if already completed
    const existing = await sql`
      SELECT id FROM habit_completions 
      WHERE habit_id = ${id} AND completed_date = ${date}
      LIMIT 1
    `

    if (existing.length > 0) {
      // Remove completion
      await sql`
        DELETE FROM habit_completions 
        WHERE habit_id = ${id} AND completed_date = ${date}
      `
      return NextResponse.json({ completed: false })
    } else {
      // Add completion - use ON CONFLICT to handle duplicate key errors
      await sql`
        INSERT INTO habit_completions (habit_id, completed_date)
        VALUES (${id}, ${date})
        ON CONFLICT (habit_id, completed_date) DO NOTHING
      `
      return NextResponse.json({ completed: true })
    }
  } catch (error) {
    console.error("[v0] Error toggling habit completion:", error)
    return NextResponse.json({ error: "Failed to toggle habit" }, { status: 500 })
  }
}
