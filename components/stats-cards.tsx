'use client'

import { useMemo, useState, useEffect } from 'react'
import { useHabitsStore, getCompletionRate } from '@/lib/store'
import { Icons } from './icons'

export function StatsCards() {
  const [mounted, setMounted] = useState(false)
  const { habits, completions, selectedDate } = useHabitsStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const stats = useMemo(() => {
    // Default values for SSR and initial render
    const defaultStats = {
      todayTotal: 0,
      todayCompleted: 0,
      todayRate: 0,
      currentStreak: 0,
      weeklyCompletions: 0,
      overallRate: 0,
    }
    
    if (!mounted || !selectedDate) {
      return defaultStats
    }
    
    const activeHabits = habits.filter((h) => !h.archived)
    
    // Today's stats based on selectedDate from store (not new Date())
    const todayCompletions = completions.filter(
      (c) => c.date === selectedDate && c.completed
    )
    const todayTotal = activeHabits.length
    const todayCompleted = todayCompletions.length
    
    // Calculate overall streak using selectedDate as reference
    const referenceDate = new Date(selectedDate)
    let currentStreak = 0
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(referenceDate)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const hasCompletion = completions.some(
        (c) => c.date === dateStr && c.completed
      )
      
      if (hasCompletion) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }
    
    // Calculate weekly completions using selectedDate as reference
    const weekStart = new Date(referenceDate)
    weekStart.setDate(weekStart.getDate() - 7)
    const weeklyCompletions = completions.filter((c) => {
      const date = new Date(c.date)
      return date >= weekStart && date <= referenceDate && c.completed
    }).length

    // Calculate overall completion rate
    const overallRate = activeHabits.length > 0
      ? Math.round(
          activeHabits.reduce((sum, h) => {
            const habitCompletions = completions.filter((c) => c.habitId === h.id)
            return sum + getCompletionRate(habitCompletions, 30)
          }, 0) / activeHabits.length
        )
      : 0

    return {
      todayTotal,
      todayCompleted,
      todayRate: todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0,
      currentStreak,
      weeklyCompletions,
      overallRate,
    }
  }, [habits, completions, selectedDate, mounted])

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Today's Progress */}
      <div className="bg-primary rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.target className="size-4 text-primary-foreground/80" />
          <span className="text-xs text-primary-foreground/80">Hoje</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary-foreground">
            {stats.todayCompleted}
          </span>
          <span className="text-primary-foreground/60">/{stats.todayTotal}</span>
        </div>
        <div className="mt-2 h-1.5 bg-primary-foreground/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-foreground rounded-full transition-all"
            style={{ width: `${stats.todayRate}%` }}
          />
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.flame className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">Sequência</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{stats.currentStreak}</span>
          <span className="text-muted-foreground">dias</span>
        </div>
      </div>

      {/* Weekly Completions */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.calendar className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Esta Semana</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{stats.weeklyCompletions}</span>
          <span className="text-muted-foreground">conclusões</span>
        </div>
      </div>

      {/* Overall Rate */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.stats className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Taxa (30d)</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{stats.overallRate}</span>
          <span className="text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  )
}
