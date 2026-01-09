import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { Habit } from "@/lib/types"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await sql`DELETE FROM habits WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting habit:", error)
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, emoji, goal, motivation, reminder, frequency, color, start_date, end_date } = body

    const [habit] = await sql<Habit[]>`
      UPDATE habits
      SET name = ${name}, emoji = ${emoji}, goal = ${goal}, 
          motivation = ${motivation}, reminder = ${reminder},
          frequency = ${JSON.stringify(frequency)}, color = ${color},
          start_date = ${start_date}, end_date = ${end_date}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json(habit)
  } catch (error) {
    console.error("Error updating habit:", error)
    return NextResponse.json({ error: "Failed to update habit" }, { status: 500 })
  }
}
