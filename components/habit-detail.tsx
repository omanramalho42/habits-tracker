"use client"

import type { HabitWithStats } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { WEEKDAYS } from "@/lib/habit-utils"

interface HabitDetailProps {
  habit: HabitWithStats
  onBack: () => void
  onToggle: (date: string) => void
}

export function HabitDetail({ habit, onBack, onToggle }: HabitDetailProps) {
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getMonthData = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = new Date(year, month, 1).getDay()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const isDateCompleted = (day: number) => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return habit.completions.some((c) => c.completed_date === dateStr)
  }

  const handleDayClick = (day: number) => {
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    onToggle(dateStr)
  }

  const monthDays = getMonthData()

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-background text-4xl">
            {habit.emoji}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{habit.name}</h2>
            <p className="text-muted-foreground">{habit.goal}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{habit.current_streak}</div>
            <div className="text-sm text-muted-foreground mt-1">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{habit.longest_streak}</div>
            <div className="text-sm text-muted-foreground mt-1">Longest Streak</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{habit.completion_rate}%</div>
            <div className="text-sm text-muted-foreground mt-1">Completion Rate</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Calendar</h3>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((day, index) => (
            <button
              key={index}
              onClick={() => day && handleDayClick(day)}
              disabled={!day}
              className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                day
                  ? isDateCompleted(day)
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                  : ""
              }`}
            >
              {day && (
                <>
                  {isDateCompleted(day) && <Check className="h-4 w-4 absolute" />}
                  <span className={isDateCompleted(day) ? "opacity-0" : ""}>{day}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
