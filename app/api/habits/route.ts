import { z } from 'zod'

import { type NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

import { isHabitActiveOnDate } from '@/lib/habit-utils'
import { CreateHabitSchema } from '@/lib/schema/habit'
import { inngest } from '@/lib/inngest/client'
import { welcomeEmailTemplate } from '@/lib/nodemailer/template'
import { transporter } from '@/lib/nodemailer'
import { sendDailyHabitReminder } from '@/lib/inngest/functions'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }
    
    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })
    
    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const paramDate = searchParams.get('selectedDate')
    
    const validator = z.string()
    const queryParams = validator.safeParse(paramDate)

    await inngest.send({
      name: "app/user.created",
      data: {
        email: "contato@habits.app.br",
        name: "Teste"
      }
    })
    const htmlTemplate = 
      welcomeEmailTemplate("Oman")

    const mailOptions = {
      from: "contato@habits.app.br",
      to: 'omanapple42@hotmail.com',
      subject: `Seja bem vindo ao ecossitema de hábitos 🪄`,
      text: 'Obrigado por se juntar ao Habits App',
      html: htmlTemplate
    }

    await transporter.sendMail(mailOptions)
    
    const habits = await prisma.habit.findMany({
      where: {
        userId: userDb.id,
        status: 'ACTIVE'
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        completions: true,
        categories: {
          where: {
            status: 'ACTIVE'
          }
        },
        goals: {
          where: {
            status: "ACTIVE"
          }
        },
        schedules: true,
      }
    })

    if (queryParams.success) {
      if(queryParams.data) {

        const activeHabits: any[] = habits.filter((habit: any) =>
          isHabitActiveOnDate(habit, new Date(queryParams.data))
        )
        
        return NextResponse.json(activeHabits)
      }
    }

    return NextResponse.json(habits)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching habits:", error.message)
      return NextResponse.json({
        error: error.message
      }, { status: 500 })
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({
        error: "Unauthorized"
      }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: {
        clerkUserId: userId
      }
    })

    if (!userDb) {
      return NextResponse.json({
        error: "user not find on db"
      }, { status: 401 })
    }
    
    const body = await request.json()

    const parsedBody = CreateHabitSchema.safeParse(body)

    if (!parsedBody.success) throw new Error(parsedBody.error.message)
    
    const {
      name,
      emoji,
      endDate,
      startDate,
      reminder, 
      frequency,
      color,
      clock,
      limitCounter,
      custom_field,
      duration,
      goals,
      categories
    } = parsedBody.data

    const date = startDate ? new Date(startDate) : new Date()
    const newStartdate = new Date(date)
      newStartdate.setHours(0,0,0,0)
    const newEnddate = 
      endDate ? new Date(endDate) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newHabit = await prisma.habit.create({
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        reminder,
        frequency, // Json
        color,
        customField: custom_field,
        duration,
        limitCounter: Number(limitCounter) || 1,
        ...(goals  && {goals: {
          connect: {
            id: goals
          }
        }}),
        ...(categories  && {categories: {
          connect: {
            id: categories
          }
        }}),
        clock
      },
      include: {
        completions: true,
      },
    })
    console.log(newHabit, "new habit")
    return NextResponse.json(newHabit)
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error create habits:", error)
      return NextResponse.json({
        error: "Failed to create new habit"
      }, { status: 500 })
    }
  }
}
