import { auth } from "@clerk/nextjs/server"
import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const settings = await sql`
    SELECT * FROM user_settings WHERE user_id = ${userId}
  `

  if (settings.length === 0) {
    const newSettings = await sql`
      INSERT INTO user_settings (user_id)
      VALUES (${userId})
      RETURNING *
    `
    return NextResponse.json(newSettings[0])
  }

  return NextResponse.json(settings[0])
}

export async function PATCH(request: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  const updated = await sql`
    UPDATE user_settings
    SET 
      notifications_enabled = COALESCE(${body.notifications_enabled}, notifications_enabled),
      email_notifications = COALESCE(${body.email_notifications}, email_notifications),
      sms_notifications = COALESCE(${body.sms_notifications}, sms_notifications),
      email = COALESCE(${body.email}, email),
      phone = COALESCE(${body.phone}, phone),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
    RETURNING *
  `

  return NextResponse.json(updated[0])
}
