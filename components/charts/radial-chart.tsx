"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { PolarGrid, RadialBar, RadialBarChart } from "recharts"

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

import type { Task } from "@prisma/client"

interface ChartRadialProps {
  tasks: Task[]
}

const ChartRadialGrid: React.FC<ChartRadialProps> = ({ tasks }) => {
  // console.log(tasks, "tasks")
  const chartData = React.useMemo(() => {
    const map = new Map<string, number>()

    tasks.forEach((task) => {
      if (!task.createdAt) return

      const date = new Date(task.createdAt)
      date.setHours(0, 0, 0, 0)

      const key = date.toISOString().split("T")[0]

      if (!map.has(key)) {
        map.set(key, 0)
      }

      map.set(key, map.get(key)! + 1)
    })

    return Array.from(map.entries())
      .map(([date, total]) => ({
        date,
        total,
        fill: "hsl(221 83% 53%)",
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [tasks])

  const chartConfig: ChartConfig = {
    total: {
      label: "Tarefas criadas",
      color: "hsl(221 83% 53%)",
    },
  }

  const totalTasks = chartData.reduce((acc, item) => acc + item.total, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Atividade por Data</CardTitle>
        <CardDescription>
          Distribuição de tarefas criadas ao longo do tempo
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-65"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={30}
            outerRadius={110}
          >
            <PolarGrid gridType="circle" />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => {
                    const date = props?.payload?.date

                    return [
                      `${value} tarefas `,
                      date
                        ? new Date(date).toLocaleDateString("pt-BR")
                        : "Sem data",
                    ]
                  }}
                />
              }
            />

            <RadialBar
              dataKey="total"
              background
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium">
          Total de tarefas: {totalTasks}
          <TrendingUp className="h-4 w-4" />
        </div>

        <div className="text-muted-foreground">
          Baseado na data de criação das tarefas
        </div>
      </CardFooter>
    </Card>
  )
}

export default ChartRadialGrid