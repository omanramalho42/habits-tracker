"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import type {
  Task,
  Categories
} from "@prisma/client"

interface ChartPieProps {
  tasks: (Task & {
    categories?: Categories[]
  })[]
}

const ChartPieLabel: React.FC<ChartPieProps> = ({ tasks }) => {

  const chartData = React.useMemo(() => {
    const map = new Map<string, { total: number; color?: string }>()

    tasks.forEach((task) => {
      task.categories?.forEach((category) => {
        const key = category.name

        if (!map.has(key)) {
          map.set(key, {
            total: 0,
            color: category.color || undefined,
          })
        }

        map.get(key)!.total += 1
      })
    })

    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value: value.total,
      fill: value.color || "hsl(var(--chart-1))",
    }))
  }, [tasks])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: {
        label: "Tarefas"
      },
    }

    chartData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      }
    })

    return config
  }, [chartData])

  const totalTasks = chartData.reduce((acc, item) => acc + item.value, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distribuição por Categorias</CardTitle>
        <CardDescription>
          Veja como suas tarefas estão distribuídas entre categorias
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-65"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${value} tarefa(s) de `,
                    name,
                  ]}
                />
              }
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              label
            />
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total de tarefas: {totalTasks}
          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="text-muted-foreground">
          Distribuição baseada nas categorias associadas às tarefas
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartPieLabel