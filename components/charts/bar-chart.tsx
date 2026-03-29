"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
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

const chartConfig = {
  total: {
    label: "Total de tarefas",
    color: "hsl(221 83% 53%)", // azul
  },
  completed: {
    label: "Concluídas",
    color: "hsl(142 76% 36%)", // verde
  },
} satisfies ChartConfig

interface ChartBarProps {
  tasks: (Task & {
    metrics?: TaskMetric[]
    completions?: TaskCompletion[]
  })[]
}

const ChartBarInteractive: React.FC<ChartBarProps> = ({ tasks }) => {
  const [timeRange, setTimeRange] = React.useState("90d")

  const chartData = React.useMemo(() => {
    const map = new Map<string, { total: number; completed: number }>()

    const now = new Date()

    let days = 90
    if (timeRange === "30d") days = 30
    if (timeRange === "7d") days = 7

    const startDate = new Date()
    startDate.setDate(now.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    tasks.forEach((task) => {
      // TOTAL
      const createdAt = new Date(task.createdAt)
      createdAt.setHours(0, 0, 0, 0)

      if (createdAt >= startDate) {
        const date = createdAt.toISOString().split("T")[0]

        if (!map.has(date)) {
          map.set(date, { total: 0, completed: 0 })
        }

        map.get(date)!.total += 1
      }

      // COMPLETED
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

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Distribuição de Tarefas</CardTitle>
          <CardDescription>
            Compare tarefas criadas e concluídas ao longo do tempo
          </CardDescription>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-40 sm:flex">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="90d">Últimos 3 meses</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
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

            <Bar
              dataKey="total"
              fill="hsl(221 83% 53%)"
              radius={[6, 6, 0, 0]}
            />

            <Bar
              dataKey="completed"
              fill="hsl(142 76% 36%)"
              radius={[6, 6, 0, 0]}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartBarInteractive