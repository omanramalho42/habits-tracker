import nodemailer from "nodemailer"

import { welcomeEmailTemplate } from "./template"
import { WelcomeEmailData } from "../types"

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
  const htmlTemplate = 
    welcomeEmailTemplate(name)

  const mailOptions = {
    from: "contato@habits.app.br",
    to: email,
    subject: `Bem vindo ao laboratório de hábitos aqui você gerencia sua vida!`,
    text: 'Obrigado por se juntar ao Habits App',
    html: htmlTemplate
  }

  console.log("email send success");

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
    from: "contato@habits.app.br",
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
