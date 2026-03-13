'use client'

import { useMemo } from 'react'
import { useHabitsStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const DAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export function WeekStrip() {
  const { habits, completions, selectedDate, setSelectedDate } = useHabitsStore()

  const weekDays = useMemo(() => {
    const selected = new Date(selectedDate)
    const dayOfWeek = selected.getDay()
    // Adjust for Monday start
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(selected)
    monday.setDate(selected.getDate() + mondayOffset)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      
      const activeHabits = habits.filter((h) => !h.archived)
      const dayCompletions = completions.filter(
        (c) => c.date === dateStr && c.completed
      )
      const completionRate = activeHabits.length > 0
        ? dayCompletions.length / activeHabits.length
        : 0

      return {
        date,
        dateStr,
        dayName: DAYS_SHORT[i],
        dayNumber: date.getDate(),
        isSelected: dateStr === selectedDate,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        completionRate,
      }
    })
  }, [selectedDate, habits, completions])

  return (
    <div className="bg-card rounded-xl border border-border p-3">
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <button
            key={day.dateStr}
            onClick={() => setSelectedDate(day.dateStr)}
            className={cn(
              'flex flex-col items-center py-2 rounded-lg transition-all',
              day.isSelected
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-secondary'
            )}
          >
            <span
              className={cn(
                'text-xs',
                day.isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}
            >
              {day.dayName}
            </span>
            <span
              className={cn(
                'text-lg font-semibold mt-0.5',
                day.isToday && !day.isSelected && 'text-primary'
              )}
            >
              {day.dayNumber}
            </span>
            {/* Completion indicator */}
            <div className="flex gap-0.5 mt-1">
              {day.completionRate > 0 && (
                <div
                  className={cn(
                    'size-1.5 rounded-full',
                    day.isSelected
                      ? 'bg-primary-foreground'
                      : day.completionRate >= 1
                      ? 'bg-primary'
                      : 'bg-primary/50'
                  )}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
