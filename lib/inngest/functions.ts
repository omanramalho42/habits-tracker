import { inngest } from "./client"
import { sendEmail } from "@/lib/email"
import { dailyReminderEmailTemplate, welcomeEmailTemplate } from "@/lib/email-templates"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/created" },
  async ({ event }) => {
    const { email, firstName, userId } = event.data

    await sendEmail({
      to: email,
      subject: "Welcome to Wisey! 🎯",
      html: welcomeEmailTemplate(firstName || "there"),
    })

    return { success: true }
  },
)

export const sendDailyReminders = inngest.createFunction(
  { id: "send-daily-reminders" },
  { cron: "0 5 * * *" }, // Every day at 5 AM
  async () => {
    const users = await sql`
      SELECT user_id, email, notifications_enabled, email_notifications
      FROM user_settings
      WHERE notifications_enabled = true AND email_notifications = true AND email IS NOT NULL
    `

    for (const user of users) {
      const today = new Date().toISOString().split("T")[0]
      const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
      const weekdayKey = dayOfWeek.substring(0, 2)

      const habits = await sql`
        SELECT name, icon
        FROM habits
        WHERE user_id = ${user.user_id}
        AND start_date <= ${today}
        AND (end_date IS NULL OR end_date >= ${today})
        AND frequency::text LIKE '%' || ${weekdayKey} || '%'
      `

      if (habits.length > 0) {
        await sendEmail({
          to: user.email,
          subject: "☀️ Your Daily Habits Reminder",
          html: dailyReminderEmailTemplate("there", habits as any),
        })
      }
    }

    return { sent: users.length }
  },
)
