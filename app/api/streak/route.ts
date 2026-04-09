import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userDb = await prisma.user.findFirst({
      where: { clerkUserId: userId }
    })

    if (!userDb) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 401 })
    }

    // 🔥 pega TODAS completions do usuário
    const completions = await prisma.habitCompletion.findMany({
      where: {
        habit: {
          userId: userDb.id
        }
      },
      select: {
        completedDate: true
      },
      orderBy: {
        completedDate: "asc"
      }
    })

    // 🔥 normaliza datas
    const dates = completions.map(c => {
      const d = new Date(c.completedDate!)
      d.setHours(0, 0, 0, 0)
      return d
    })

    // 🧠 calcula streak
    function calculateStreak(dates: Date[]) {
      if (!dates.length) return { current: 0, longest: 0, startDate: null }

      let current = 1
      let longest = 1
      let startDate = dates[0]

      for (let i = 1; i < dates.length; i++) {
        const diff =
          (dates[i].getTime() - dates[i - 1].getTime()) /
          (1000 * 60 * 60 * 24)

        if (diff === 1) {
          current++
          longest = Math.max(longest, current)
        } else {
          current = 1
        }
      }

      return {
        current,
        longest,
        startDate
      }
    }

    const { current, longest, startDate } = calculateStreak(dates)

    // 📅 semana atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekDays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]

    const currentWeek = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date()
      date.setDate(today.getDate() - today.getDay() + i)
      date.setHours(0, 0, 0, 0)

      const completed = dates.some(d => d.getTime() === date.getTime())

      return {
        day: weekDays[i],
        completed,
        highlighted: date.getTime() === today.getTime()
      }
    })

    // 🎯 milestones dinâmicos
    const milestones = [7, 14, 30, 60, 100, 180, 365]

    let currentMilestone = 0
    let nextMilestone = milestones[0]

    for (let i = 0; i < milestones.length; i++) {
      if (current >= milestones[i]) {
        currentMilestone = milestones[i]
        nextMilestone = milestones[i + 1] || milestones[i]
      }
    }

    const daysToNextMilestone = Math.max(nextMilestone - current, 0)

    const progress =
      nextMilestone === currentMilestone
        ? 100
        : ((current - currentMilestone) /
            (nextMilestone - currentMilestone)) *
          100

    return NextResponse.json({
      currentStreak: current,
      maxStreak: longest,
      startedAt: startDate,
      weekDays: currentWeek,
      currentMilestone,
      nextMilestone,
      daysToNextMilestone,
      progress: Math.round(progress)
    })

  } catch (error) {
    console.error("🔥 streak error:", error)

    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 })
  }
}