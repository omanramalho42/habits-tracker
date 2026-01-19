"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"

import HeatMapHabit from "@/components/heat-map"

import { WEEKDAYS } from "@/lib/habit-utils"

import type { HabitWithStats } from "@/lib/types"

import {
  TrendingUp,
  Calendar,
  Target,
  Flame,
} from "lucide-react"

interface HabitDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habit: HabitWithStats | null
}

export function HabitDetailDialog({ open, onOpenChange, habit }: HabitDetailDialogProps) {
  if (!habit) return null

  const frequency = Array.isArray(habit.frequency) ? habit.frequency : []

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-full h-dvh
          sm:h-auto
          sm:max-w-[95vw] md:max-w-3xl lg:max-w-4xl
          rounded-none sm:rounded-xl
          p-0
          overflow-hidden
        "
      >
        <div className="h-full overflow-y-auto p-4 sm:p-6 scrollbar-custom">
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-linear-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 mb-4 sm:mb-6">
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl text-3xl sm:text-4xl shadow-lg shrink-0"
                    style={{ backgroundColor: `${habit.color}30` }}
                  >
                    {habit.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                      {habit.name}
                    </h2>
                    <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
                      {habit.goal}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {WEEKDAYS.map((day) => {
                  const isActive = frequency.includes(day.key)
                  return (
                    <div
                      key={day.key}
                      className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                        isActive ? "text-white shadow-sm" : "bg-muted/50 text-muted-foreground"
                      }`}
                      style={isActive ? { backgroundColor: habit.color } : {}}
                    >
                      {day.name}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
                    <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Current</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
                  {habit.current_streak}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Longest</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
                  {habit.longest_streak}
                </div>
              </Card>

              <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
                    <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Sucesso</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
                  {habit.completion_rate}%
                </div>
              </Card>

            </div> */}
          </div>

          <Card className="p-4 sm:p-6 bg-card border-border">
            <div className="flex">

              <div className="flex flex-col items-start gap-2">
                <div className="flex flex-row items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                    Calendário de atividades
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Aqui voce monitorar seu progresso com base na sua aviabilidade e hitórico de atividades.
                </p>
              </div>

              {/* <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select
                  value={displayMonth.toString()}
                  onValueChange={(value) => setDisplayMonth(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-full sm:w-25">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={displayYear.toString()}
                  onValueChange={(value) => setDisplayYear(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}
            </div>

            <div className="overflow-x-auto">
              <div className="w-full">
                <HeatMapHabit
                  habitColor={habit.color}
                  startDate={new Date(habit.startDate)}
                  endDate={habit.endDate ? new Date(habit.endDate) : null}
                  completions={habit.completions}
                  habitFrequency={habit.frequency}
                />
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
