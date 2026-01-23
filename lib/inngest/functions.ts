import { inngest } from "./client"
import { sendDailyHabitsEmail, sendWelcomeEmail } from "../nodemailer"

import { prisma } from "../prisma"

import { PERSONALIZED_WELCOME_EMAIL_PROMPT } from "./prompts"


export const sendSignUpEmail = inngest.createFunction(
  { id: 'sign-up-email' },
  { event: 'app/user.created'},

  async ({ event, step }) => {
    const userProfile = `
      - Nome: ${event.data.name}
      - Emoji: ${event.data.emoji}
    `
    const prompt =
      PERSONALIZED_WELCOME_EMAIL_PROMPT
      .replace('{{userProfile}}', userProfile)

    const response = await step.ai.infer('generate-welcome-intro', {
      model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
      body: {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt }
            ]
          }]
      }
    })

    await step.run('send-welcome-email', async () => {
      const part = response.candidates?.[0]?.content?.parts?.[0];
      const introText = (part && 'text' in part ? part.text : null) || 'Obrigado por se juntar ao Habit. Agora voce consegue gerenciar sua rotina'

      const { data: { email, name } } = event;

      return await sendWelcomeEmail({
        email,
        name,
        intro: introText
      });
    })

    return {
      success: true,
      message: 'Welcome email sent successfully'
    }
  }
)

export const sendDailyHabitReminder = inngest.createFunction(
  { id: "daily-habit-reminder" },
  [{ event: 'app/send.daily.habits' }, { cron: "0 12 * * *" }],

  async ({ step }) => {
    const users = await step.run("fetch-users-with-habits", async () => {
      const today = new Date()
      today.setHours(0, 0 ,0 ,0)

      return prisma.user.findMany({
        include: {
          habits: {
            where: {
              status: "ACTIVE",
            },
            include: {
              completions: {
                where: {
                  completedDate: {
                    gte: today,
                  },
                },
              },
            },
          },
        },
      })
    })

    for (const user of users) {
      const allHabits = user.habits.filter(
        (habit) => habit
      )

      if (allHabits.length === 0) continue

      await step.run(`send-email-${user.id}`, async () => {
        return sendDailyHabitsEmail({
          email: user.email,
          name: user.firstName || "",
          habits: allHabits.map(h => ({
            name: h.name,
            emoji: h.emoji
          }))
        })
      })
    }

    return {
      success: true,
      message: "Daily habit reminders sent",
    }
  }
)