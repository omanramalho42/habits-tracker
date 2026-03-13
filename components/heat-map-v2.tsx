'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { HabitWithStats } from '@/lib/types'
import { fetchHabits } from '@/services/habits'

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

interface HeatMapProps {
  habitId?: string
  weeks?: number
}

export function HeatMap({ habitId, weeks = 12 }: HeatMapProps) {
  const {
    data: habits = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
  })

  const heatMapData = useMemo(() => {
    const today = new Date()
    const data: { date: string; level: number; count: number }[][] = []
    
    // Calculate start date (weeks ago, aligned to Sunday)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (weeks * 7) - today.getDay())
    
    const activeHabits = habits.filter((h) => h.status === "ARCHIVED")
    const maxPossible = habitId ? 1 : activeHabits.length

    const completions = habits.flatMap(h => h.completions)

    for (let week = 0; week <= weeks; week++) {
      const weekData: { date: string; level: number; count: number }[] = []
      
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + week * 7 + day)
        const dateStr = date.toISOString().split('T')[0]
        
        let count = 0
        if (habitId) {
          count = completions.some(
            c =>
              c.habitId === habitId &&
              c.completedDate && c.completedDate.startsWith(dateStr)
          )
            ? 1
            : 0
        } else {
          count = completions.filter(c =>
             c.completedDate && c.completedDate.toString().startsWith(dateStr)
          ).length
        }

        // Calculate level (0-4) based on completion
        let level = 0
        if (maxPossible > 0 && count > 0) {
          const rate = count / maxPossible
          if (rate <= 0.25) level = 1
          else if (rate <= 0.5) level = 2
          else if (rate <= 0.75) level = 3
          else level = 4
        }

        weekData.push({ date: dateStr, level, count })
      }
      
      data.push(weekData)
    }

    return data
  }, [habits, habitId, weeks])

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = []
    let lastMonth = -1

    heatMapData.forEach((week, weekIndex) => {
      const firstDayOfWeek = new Date(week[0].date)
      const month = firstDayOfWeek.getMonth()
      
      if (month !== lastMonth) {
        labels.push({ month: MONTHS[month], weekIndex })
        lastMonth = month
      }
    })

    return labels
  }, [heatMapData])

  return (
    <div className="bg-card border border-border rounded-xl p-4 overflow-x-auto scroll-container">
      {/* Month labels */}
      <div className="flex mb-2 ml-6">
        {monthLabels.map((label, i) => (
          <div
            key={i}
            className="text-xs text-muted-foreground"
            style={{
              position: 'relative',
              left: `${label.weekIndex * 14}px`,
              marginRight: i < monthLabels.length - 1 ? '0' : 'auto',
            }}
          >
            {label.month}
          </div>
        ))}
      </div>

      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1">
          {DAYS.map((day, i) => (
            <div
              key={i}
              className="text-[10px] text-muted-foreground h-3 flex items-center justify-end pr-1"
            >
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-0.5">
          {heatMapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-0.5">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={cn(
                    'size-3 rounded-sm transition-colors',
                    day.level === 0 && 'bg-secondary',
                    day.level === 1 && 'bg-chart-1/30',
                    day.level === 2 && 'bg-chart-1/50',
                    day.level === 3 && 'bg-chart-1/75',
                    day.level === 4 && 'bg-chart-1'
                  )}
                  title={`${day.date}: ${day.count} conclusões`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="size-3 rounded-sm bg-secondary" />
        <div className="size-3 rounded-sm bg-chart-1/30" />
        <div className="size-3 rounded-sm bg-chart-1/50" />
        <div className="size-3 rounded-sm bg-chart-1/75" />
        <div className="size-3 rounded-sm bg-chart-1" />
        <span>Mais</span>
      </div>
    </div>
  )
}
