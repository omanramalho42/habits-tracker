"use client"

import { useMemo, useState } from "react"
import Image from "next/image"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

import {
  ChevronLeft,
  ChevronRight,
  Eye
} from "lucide-react"

import type {
  Annotations,
  Counter,
  Task,
  TaskCompletion,
  TaskMetric,
  TaskMetricCompletion,
} from "@prisma/client"

interface Props {
  task: (Task & {
    completions?: (TaskCompletion & {
      counter?: Counter
      metrics?: (TaskMetric[] & {
        completions?: TaskMetricCompletion[]
      }),
      annotations?: Annotations[]
    })[]
  })
  trigger?: React.ReactNode
}

export function TaskDetailsDialog({ task, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date())

  // 📊 total completions
  const totalCompleted = useMemo(() => {
    return task?.completions?.length || 0
  }, [task.completions])

  // 📈 gráfico
  const chartData = useMemo(() => {
    return task?.completions?.map((c) => ({
      date: new Date(c.completedDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit"
      }),
      value: c.counter ?? 1
    }))
  }, [task.completions])

  // 📅 calendário
  const calendarData = useMemo(() => {
    const year = date.getFullYear()
    const month = date.getMonth()

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1

      const completed = task.completions?.some((c) => {
        const d = new Date(c.completedDate)
        return (
          d.getDate() === day &&
          d.getMonth() === month &&
          d.getFullYear() === year
        )
      })

      return { day, completed }
    })
  }, [task.completions, date])

  const handlePrev = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  const handleNext = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }

  // console.log(task, "tasj")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="icon" variant="ghost">
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{task.emoji}</span>
            {task.name}
          </DialogTitle>
        </DialogHeader>

        {/* 📊 RESUMO */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2 text-center">
            <p className="text-lg font-bold">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Execuções</p>
          </Card>

          <Card className="p-2 text-center">
            <p className="text-lg font-bold">
              {task.limitCounter || 1}
            </p>
            <p className="text-xs text-muted-foreground">Meta</p>
          </Card>

          <Card className="p-2 text-center">
            <p className="text-lg font-bold text-green-500">
              {Math.round((totalCompleted / 30) * 100)}%
            </p>
            <p className="text-xs text-muted-foreground">30d</p>
          </Card>
        </div>

        {/* 📊 TABS */}
        <Tabs defaultValue="line">
          <TabsList className="w-full max-w-full scroll-container overflox-x-visible">
            <TabsTrigger value="line" className="flex-1 text-xs">
              Linha
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1 text-xs">
              Calendário
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex-1 text-xs">
              Métricas
            </TabsTrigger>
            <TabsTrigger value="media" className="flex-1 text-xs">
              Mídia
            </TabsTrigger>
            <TabsTrigger value="annotations" className="flex-1 text-xs">
              Anotações
            </TabsTrigger>
          </TabsList>

          {/* 📈 LINE */}
          <TabsContent value="line">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* 📅 CALENDAR */}
          <TabsContent value="calendar">
            <div className="flex justify-between items-center mb-2">
              <Button variant="ghost" size="icon" onClick={handlePrev}>
                <ChevronLeft />
              </Button>

              <p className="text-sm">
                {date.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric"
                })}
              </p>

              <Button variant="ghost" size="icon" onClick={handleNext}>
                <ChevronRight />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((d) => (
                <div
                  key={d.day}
                  className={`h-8 flex items-center justify-center rounded text-xs ${
                    d.completed
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {d.day}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* 📊 METRICS */}
          <TabsContent value="metrics">
            <div className="space-y-2">
              {task.completions?.map((c) => (
                <Card key={c.id} className="p-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.completedDate).toLocaleDateString()}
                  </p>

                  {c.metrics?.length ? (
                    c.metrics.map((m) => (
                      <div
                        key={m.id}
                        className="flex justify-between text-xs"
                      >
                        <span>{m.emoji} {m.field}</span>
                        {/* <span>{m.value} {m.unit}</span> */}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Sem métricas
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="space-y-3">
              <Card className="p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">

                  {/* IMAGE */}
                  {task.imageUrl !== null && (
                    <div className="relative w-full h-32 rounded-md overflow-hidden">
                      <Image
                        src={task.imageUrl}
                        alt="task image"
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}

                  {/* VIDEO */}
                  {task.videoUrl !== null && (
                    <video
                      src={task.videoUrl}
                      controls
                      className="w-full h-32 object-cover rounded-md"
                    />
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="annotations">
            <div className="space-y-2">

              {task.completions?.map((c) => {
                if (!c.annotations || c.annotations.length === 0) return null

                return (
                  <Card key={c.id} className="p-2 space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.completedDate).toLocaleDateString()}
                    </p>

                    {c.annotations.map((a) => (
                      <div key={a.id} className="space-y-2">

                        {/* TEXTO */}
                        {a.summary && (
                          <p className="text-sm text-foreground leading-snug">
                            {a.summary}
                          </p>
                        )}

                        {/* MIDIA */}
                        <div className="grid grid-cols-2 gap-2">

                          {a.imageUrl && (
                            <div className="relative w-full h-32 rounded-md overflow-hidden">
                              <Image
                                src={a.imageUrl}
                                alt="annotation image"
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          {/* {a.videoUrl && (
                            <video
                              src={a.videoUrl}
                              controls
                              className="w-full h-32 object-cover rounded-md"
                            />
                          )} */}

                        </div>

                      </div>
                    ))}
                  </Card>
                )
              })}

              {/* EMPTY STATE */}
              {task.completions?.every(
                (c) => !c.annotations || c.annotations.length === 0
              ) && (
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma anotação encontrada.
                </p>
              )}

            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}