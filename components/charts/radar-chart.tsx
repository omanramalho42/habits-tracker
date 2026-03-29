"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart
} from "recharts"

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
  Goals
} from "@prisma/client"

interface ChartRadarProps {
  tasks: (Task & {
    goals?: Goals[]
  })[]
}

const ChartRadarDots: React.FC<ChartRadarProps> = ({ tasks }) => {

  const chartData = React.useMemo(() => {
    const map = new Map<string, number>()

    tasks.forEach((task) => {
      task.goals?.forEach((goal) => {
        const key = goal.name

        if (!map.has(key)) {
          map.set(key, 0)
        }

        map.set(key, map.get(key)! + 1)
      })
    })

    return Array.from(map.entries()).map(([goal, total]) => ({
      goal,
      total,
    }))
  }, [tasks])

  const chartConfig: ChartConfig = {
    total: {
      label: "Tarefas por objetivo",
      color: "hsl(262 83% 58%)", // roxo (diferente dos outros gráficos)
    },
  }

  const totalGoals = chartData.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Distribuição por Objetivos</CardTitle>
        <CardDescription>
          Veja como suas tarefas estão alinhadas com seus objetivos
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    `${value} tarefas`,
                    name,
                  ]}
                />
              }
            />

            <PolarAngleAxis dataKey="goal" />
            <PolarGrid />

            <Radar
              dataKey="total"
              fill="hsl(262 83% 58%)"
              fillOpacity={0.6}
              stroke="hsl(262 83% 58%)"
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total de associações: {totalGoals}
          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="text-muted-foreground">
          Distribuição baseada nos objetivos vinculados às tarefas
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartRadarDots