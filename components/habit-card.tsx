"use client"

import type React from "react"
import { toast } from "react-toastify"

import type { HabitWithStats } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Pencil, Trash2, TrendingUp } from "lucide-react"
import { WEEKDAYS, WEEKDAY_MAP } from "@/lib/habit-utils"
import { cn } from "@/lib/utils"

interface HabitCardProps {
  habit: HabitWithStats
  onToggle: (habitId: number) => void
  onEdit?: (habit: HabitWithStats) => void
  onDelete?: (habitId: number) => void
  onClick?: () => void
  selectedDate?: Date
  onError?: (message: string) => void
}

export function HabitCard({ habit, onToggle, onEdit, onDelete, onClick, selectedDate, onError }: HabitCardProps) {
  const frequency =
    Array.isArray(habit.frequency) ? habit.frequency : []

  const currentDate =
    selectedDate || new Date()
  const todayStr =
    currentDate.toISOString().split("T")[0]

  const isCompletedToday = habit.completions?.some((c) => {
    const completionDate = new Date(c.completedDate).toISOString().split("T")[0]
    return completionDate === todayStr
  })

  const currentDayOfWeek = currentDate.getDay()
  const currentDayKeys = Object.entries(WEEKDAY_MAP)
    .filter(([_, value]) => value === currentDayOfWeek)
    .map(([key]) => key)
  const isActiveToday = currentDayKeys.some((key) => frequency.includes(key))

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const checkDate = new Date(currentDate)
  checkDate.setHours(0, 0, 0, 0)
  const isFutureDate = checkDate > today

  const canToggle = isActiveToday && !isFutureDate

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!canToggle) {
      if (isFutureDate) {
        onError?.("❌ Não é possível concluir um hábito futuro")
        toast.error("❌ Não é possível concluir um hábito futuro")
      } else if (!isActiveToday) {
        onError?.("❌ Este hábito não está agendado para este dia")
        toast.error("❌ Este hábito não está agendado para este dia")
      }
      return
    }
    onToggle(habit.id)
  }

  return (
    <Card
      className={`group p-5 bg-linear-to-br transition-all hover:shadow-lg cursor-pointer ${
        isCompletedToday
          ? "from-green-500/20 to-green-500/5 border-green-500/30"
          : "from-card to-card/50 border-border/50 hover:border-primary/30"
      }`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) return
        onClick?.()
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl text-3xl flex-shrink-0 shadow-sm"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-foreground">{habit.name}</h3>
              {habit.current_streak > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {habit.current_streak}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{habit.goal}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                {WEEKDAYS.map((day, index) => {
                  const isActive = frequency.includes(day.key)
                  const isCompletedThisWeekday = isCompletedToday && currentDayOfWeek === index

                  return (
                    <div
                      key={index}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                        isActive ? "text-white shadow-sm" : "bg-muted/50 text-muted-foreground"
                      }`}
                      style={isActive ? { backgroundColor: isCompletedThisWeekday ? "#10B981" : habit.color } : {}}
                    >
                      {day.label}
                    </div>
                  )
                })}
              </div>
              <span className="text-xs text-muted-foreground font-medium">{habit.completions.length} completados</span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 transition-opacity",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100",
          )}
        >
          {/* {onEdit && (
            <Button
              variant="ghost"
              disabled
              size="icon"
              className="h-9 w-9 hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(habit)
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              disabled
              size="icon"
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                if (confirm("Are you sure you want to delete this habit?")) {
                  onDelete(habit.id)
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )} */}
          <Button
            variant={isCompletedToday ? "default" : "outline"}
            size="icon"
            className={cn(
              "h-11 w-11 rounded-xl transition-all",
              isCompletedToday && "shadow-md bg-green-500 hover:bg-red-500 border-green-500",
              !isCompletedToday &&
                !canToggle &&
                "opacity-50 cursor-not-allowed bg-red-500/10 border-red-500/30 text-red-500",
              !isCompletedToday &&
                canToggle &&
                "hover:border-primary/50 hover:bg-primary/5",
            )}
            onClick={handleToggleClick}
          >
            {isCompletedToday ? (
              <X className="h-5 w-5" />   // 👉 DESMARCAR
            ) : !canToggle ? (
              <X className="h-5 w-5" />   // 👉 BLOQUEADO
            ) : (
              <div className="h-5 w-5 rounded border-2 border-current" /> // 👉 MARCAR
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
