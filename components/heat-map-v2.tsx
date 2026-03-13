'use client'

import { useMemo, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HabitWithStats } from '@/lib/types'
import { fetchHabits } from '@/services/habits'
import HeatMap from '@uiw/react-heat-map'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
export type HeatMapRange = 'week' | 'month' | 'year'

interface HeatMapProps {
  habitId?: string
  view?: HeatMapRange
}

function formatLocalDate(date: Date | string) {
  const d = new Date(date)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const HeatMapHabit = ({ habitId, view = 'year' }: HeatMapProps) => {

  const [range, setRange] = useState<HeatMapRange>(view)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const { data: habits = [] } = useQuery<HabitWithStats[]>({
    queryKey: ['habits'],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
  })

  useEffect(() => {
    setRange(view)
  }, [view])
  /**
   * todos os anos que possuem registros
   */

  const availableYears = useMemo(() => {

    const years = new Set<number>()

    habits.forEach(h => {
      h.completions.forEach(c => {
        if (!c.completedDate) return
        years.add(new Date(c.completedDate).getFullYear())
      })
    })

    return Array.from(years).sort()

  }, [habits])

  /**
   * primeira completion
   */

  const firstCompletionDate = useMemo(() => {

    const completions = habits.flatMap(h => h.completions)

    if (!completions.length) return null

    const dates = completions
      .filter(c => c.completedDate)
      .map(c => new Date(c.completedDate))

    if (!dates.length) return null

    return new Date(Math.min(...dates.map(d => d.getTime())))

  }, [habits])

  /**
   * intervalo do heatmap
   */

  const { startDate, endDate } = useMemo(() => {

    const start = new Date()
    const end = new Date()

    start.setHours(0,0,0,0)
    end.setHours(0,0,0,0)

    if (range === 'week') {

      const firstDayMonth = new Date(selectedYear, selectedMonth, 1)

      const startWeek = new Date(firstDayMonth)
      startWeek.setDate(firstDayMonth.getDate() + (selectedWeek - 1) * 7)

      const endWeek = new Date(startWeek)
      endWeek.setDate(startWeek.getDate() + 6)

      return {
        startDate: formatLocalDate(startWeek),
        endDate: formatLocalDate(endWeek)
      }

    }

    if (range === 'month') {

      const startMonth = new Date(selectedYear, selectedMonth, 1)
      const endMonth = new Date(selectedYear, selectedMonth + 1, 0)

      return {
        startDate: formatLocalDate(startMonth),
        endDate: formatLocalDate(endMonth)
      }

    }

    if (range === 'year') {

      if (firstCompletionDate) {

        const startFromFirst = new Date(firstCompletionDate)

        const endFromFirst = new Date(startFromFirst)
        endFromFirst.setFullYear(endFromFirst.getFullYear() + 1)

        return {
          startDate: formatLocalDate(startFromFirst),
          endDate: formatLocalDate(endFromFirst)
        }

      }

      start.setFullYear(end.getFullYear() - 1)

    }

    return {
      startDate: formatLocalDate(start),
      endDate: formatLocalDate(end)
    }

  }, [
    range,
    selectedWeek,
    selectedMonth,
    selectedYear,
    firstCompletionDate,
    view
  ])

  /**
   * valores heatmap
   */

  const values = useMemo(() => {

    const start = new Date(startDate)
    const end = new Date(endDate)

    const activeHabits = habits.filter(h => h.status === 'ACTIVE')

    const completions = activeHabits.flatMap(h => h.completions)

    const map = new Map<string, number>()

    completions.forEach(c => {

      if (!c.completedDate) return

      if (habitId && c.habitId !== habitId) return

      const date = new Date(c.completedDate)

      if (date < start || date > end) return

      const formatted = formatLocalDate(date)

      map.set(
        formatted,
        (map.get(formatted) || 0) + 1
      )

    })

    return Array.from(map.entries()).map(([date, count]) => ({
      date,
      count
    }))

  }, [habits, habitId, startDate, endDate])

  return (
    <div className="bg-card border border-border rounded-xl p-6">

      {/* filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">

        {/* RANGE */}

        <Select
          value={range}
          onValueChange={(value) => setRange(value as HeatMapRange)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Intervalo" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="week">Semana</SelectItem>
            <SelectItem value="month">Mês</SelectItem>
            <SelectItem value="year">Ano</SelectItem>
          </SelectContent>
        </Select>


        {/* SEMANA */}

        {range === "week" && (
          <Select
            value={String(selectedWeek)}
            onValueChange={(value) => setSelectedWeek(Number(value))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Semana" />
            </SelectTrigger>

            <SelectContent>
              {[1,2,3,4].map((w) => (
                <SelectItem key={w} value={String(w)}>
                  Semana {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}


        {/* MÊS */}

        {(range === "week" || range === "month") && (
          <Select
            value={String(selectedMonth)}
            onValueChange={(value) => setSelectedMonth(Number(value))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>

            <SelectContent>
              {[
                "Jan","Fev","Mar","Abr","Mai","Jun",
                "Jul","Ago","Set","Out","Nov","Dez"
              ].map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}


        {/* ANO */}

        <Select
          value={String(selectedYear)}
          onValueChange={(value) => setSelectedYear(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>

          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      <div className="overflow-x-auto scroll-container">

        <HeatMap
          value={values}
          startDate={new Date(startDate)}
          endDate={new Date(endDate)}
          width={900}
          rectSize={12}
          space={4}
          style={{
            width: "100%",
            color: "hsl(var(--muted-foreground))",
          }}

          panelColors={{
            0: "#1f2937",
            1: "#1d4ed8",
            2: "#2563eb",
            3: "#3b82f6",
            4: "#60a5fa",
          }}

          rectProps={{
            rx: 3,
            ry: 3
          }}

          monthLabels={[
            "Jan","Fev","Mar","Abr","Mai","Jun",
            "Jul","Ago","Set","Out","Nov","Dez"
          ]}

          weekLabels={[
            "Dom","Seg","Ter","Qua","Qui","Sex","Sab"
          ]}

          rectRender={(props, data) => (
            <Tooltip>
              <TooltipTrigger asChild>
                <rect {...props}/>
              </TooltipTrigger>

              <TooltipContent>
                <div className="text-xs">
                  <strong>{data.count || 0}</strong> conclusões
                  <br/>
                  {data.date}
                </div>
              </TooltipContent>
            </Tooltip>
          )}

          legendRender={(index) => (
            <div key={index.key} className="flex items-center gap-1 text-xs mt-3 text-muted-foreground">
              <span>Menos</span>

              <div className="w-3 h-3 rounded-sm bg-[#1f2937]" />
              <div className="w-3 h-3 rounded-sm bg-[#1d4ed8]" />
              <div className="w-3 h-3 rounded-sm bg-[#2563eb]" />
              <div className="w-3 h-3 rounded-sm bg-[#3b82f6]" />
              <div className="w-3 h-3 rounded-sm bg-[#60a5fa]" />

              <span>Mais</span>
            </div>
          )}

        />

      </div>

    </div>
  )
}

export default HeatMapHabit