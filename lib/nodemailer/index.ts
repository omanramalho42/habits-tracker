import nodemailer from "nodemailer"

import { WELCOME_EMAIL_TEMPLATE } from "./template"
import { WelcomeEmailData } from "../types"

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL!,
    pass: process.env.NODEMAILER_PASSWORD!,
  }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
  const htmlTemplate = 
    WELCOME_EMAIL_TEMPLATE
      .replace("{{name}}", name)
      .replace("{{intro}}", intro)

  const mailOptions = {
    from: "'Habits tracker <habitsTracker@example.com>'",
    to: email,
    subject: `Welcome to Habits tracker - your habits toolkit is ready!`,
    text: 'Thanks for joining Habits tracker',
    html: htmlTemplate
  }

  console.log("email send sucess");

  await transporter.sendMail(mailOptions)
}

export async function sendDailyHabitsEmail({
  email,
  name,
  habits,
}: {
  email: string
  name: string
  habits: { name: string; emoji?: string | null }[]
}) {
  const habitsList = habits
    .map(h => `${h.emoji ?? "✅"} ${h.name}`)
    .join("<br/>")

  return transporter.sendMail({
    to: email,
    subject: "⏰ Seus hábitos de hoje",
    html: `
      <p>Bom dia, <strong>${name}</strong> 👋</p>
      <p>Esses hábitos ainda estão pendentes hoje:</p>
      <p>${habitsList}</p>
      <p>Pequenos passos hoje constroem grandes resultados 🚀</p>
    `,
  })
}
