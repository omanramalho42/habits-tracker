"use client"

import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  Task,
  TaskCompletion,
  TaskMetric
} from "@prisma/client"

export const description = "An interactive area chart"

const chartConfig = {
  total: {
    label: "Total de atividades",
    color: "hsl(221 83% 53%)", // azul (base)
  },
  completed: {
    label: "Tarefas concluídas",
    color: "hsl(142 76% 36%)", // verde (sucesso)
  },
}

interface ChartAreaProps {
  tasks: (Task & {
    metrics?: TaskMetric[]
    completions?: TaskCompletion[]
  })[]
}

const ChartAreaInteractive:React.FC<ChartAreaProps> = ({ tasks }) =>  {
  const [timeRange, setTimeRange] = React.useState("90d")
const chartData = React.useMemo(() => {
  const map = new Map<string, { total: number; completed: number }>()

  const now = new Date()

  let days = 90
  if (timeRange === "30d") days = 30
  if (timeRange === "7d") days = 7

  const startDate = new Date()
  startDate.setDate(now.getDate() - days)
  startDate.setHours(0, 0, 0, 0) // 🔥 CORREÇÃO IMPORTANTE

  tasks.forEach((task) => {
    // 👉 TOTAL = tarefas criadas
    const createdAt = new Date(task.createdAt)
    createdAt.setHours(0, 0, 0, 0)

    if (createdAt >= startDate) {
      const date = createdAt.toISOString().split("T")[0]

      if (!map.has(date)) {
        map.set(date, { total: 0, completed: 0 })
      }

      map.get(date)!.total += 1
    }

    // 👉 COMPLETED = baseado nas completions (CORRETO)
    task.completions?.forEach((completion) => {
      if (!completion.createdAt) return

      const completedDate = new Date(completion.createdAt)
      completedDate.setHours(0, 0, 0, 0)

      if (completedDate < startDate) return

      const date = completedDate.toISOString().split("T")[0]

      if (!map.has(date)) {
        map.set(date, { total: 0, completed: 0 })
      }

      map.get(date)!.completed += 1
    })
  })

  return Array.from(map.entries())
    .map(([date, values]) => ({
      date,
      total: values.total,
      completed: values.completed,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}, [tasks, timeRange])
  console.log(chartData, "tasks!")

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Chart Area</CardTitle>
          <CardDescription>
            Mostrando o total de tarefas / tarefas concluídas
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Ultimos 3 messes
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Ultimos 30 dias
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Ultimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-62.5 w-full"
        >
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0.1} />
            </linearGradient>

            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(221 83% 53%)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(221 83% 53%)" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })
            }
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR")
                }
              />
            }
          />

          <Area
            dataKey="completed"
            fill="url(#fillCompleted)"
            stroke="hsl(142 76% 36%)"
            strokeWidth={2}
          />

          <Area
            dataKey="total"
            fill="url(#fillTotal)"
            stroke="hsl(221 83% 53%)"
            strokeWidth={2}
          />

          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartAreaInteractive