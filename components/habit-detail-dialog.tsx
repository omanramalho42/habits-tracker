"use client"

import { useMemo, useState } from "react"

import HeatMapHabit from "@/components/heat-map"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts"

import { formatDate, WEEKDAYS } from "@/lib/habit-utils"

import type { HabitWithStats } from "@/lib/types"

import {
  Calendar,
  Eye,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react"
import CalendarDnd from "./dnd/calendar-dnd"
import Image from "next/image"

interface HabitDetailDialogProps {
  trigger?: React.ReactNode
  currentDate: Date;
  habit: HabitWithStats | null
}

export function HabitDetailDialog({ trigger, habit, currentDate }: HabitDetailDialogProps) {
  const [open, setOpen] =
    useState<boolean>(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  if (!habit) return null

  const frequency =
    Array.isArray(habit.frequency) 
      ? habit.frequency 
      : []
  
  const completion = 
    habit.completions.find(
      (c) => 
        new Date(c.completedDate).toISOString().split("T")[0] === 
       currentDate.toISOString().split("T")[0]
    )

  const totalCompleted = useMemo(() => {
    if (!habit) return 0;
    return Object.values(habit.completions).filter(Boolean).length;
  }, [habit]);

  const lineData = useMemo(() => {
    if (!habit?.completions) return [];

    const newArrayCompletions = 
      habit.completions.map((completion) => (
        completion.completedDate && {
          date: formatDate(new Date(completion.completedDate)),
          total: completion.counter
        }
      ))

    return newArrayCompletions;
  }, [habit]);

  const heatMapData = useMemo(() => {
    if (!habit?.completions) return [];

    const weeks: { date: Date; completed: boolean }[][] = [];
    const today = new Date();
    const start = new Date(today);

    start.setDate(start.getDate() - 83);
    start.setDate(start.getDate() - start.getDay());

    let currentWeek: { date: Date; completed: boolean }[] = [];
    const d = new Date(start);

    while (d <= today) {
      const key = formatDate(d);

      const completed = habit.completions.some(
        (c) => c.completedDate === key
      );

      currentWeek.push({
        date: new Date(d),
        completed,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      d.setDate(d.getDate() + 1);
    }

    if (currentWeek.length > 0) weeks.push(currentWeek);

    return weeks;
  }, [habit]);
  console.log(heatMapData, "HEAT MAP DATA!")

  const calendarData = useMemo(() => {
    if (!habit?.completions) return [];

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number | null; completed: boolean }[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, completed: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDate(new Date(year, month, d));

      const completed = habit.completions.some(
        (c) => c.completedDate === key
      );

      cells.push({
        day: d,
        completed,
      });
    }

    return cells;
  }, [habit]);
  console.log(calendarData, "calendar data")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="icon"
            variant="ghost"
            className='flex border-separate items-center bg-transparent justify-start rounded-none px-3 py-3 text-muted-foreground'
          >
            <Eye className="mr-2 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <span className="text-2xl">
              {habit.emoji}
            </span>
            {habit.name}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {/* @ts-ignore */}
            {habit.description || "Sem descrição"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalCompleted}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Total
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-2xl font-bold" style={{ color: habit.color }}>
              {habit.longest_streak}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Sequência
            </p>
          </div>
          <div className="bg-secondary rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {totalCompleted > 0 ? Math.round((totalCompleted / 30) * 100) : 0}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              Taxa (30d)
            </p>
          </div>
        </div>

        {habit.goals && habit.goals?.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">
              Objetivos vinculados
            </p>
            <div className="flex flex-wrap gap-1.5">
              {habit.goals.map((g) => (
                <span
                  key={g.id}
                  className="px-2.5 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                >
                  🎯 {g.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1">
            Frequência: semanalmente
          </p>
          <div className="flex gap-1">
            {WEEKDAYS.map((day) => {
              const isActive =
                frequency?.map(
                  (item) => item.includes(day.key)
                )
              return (
                <div
                  key={day.key}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                  style={
                    isActive ? {
                      backgroundColor: habit.color
                    } : {}
                  }
                >
                  {day.keyPtBr}
                </div>
              )
            })}
          </div>
        </div>

        <Tabs defaultValue="heatmap" className="mt-4">

          <TabsList className="bg-secondary w-full">
            <TabsTrigger value="heatmap" className="flex-1 text-xs">
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="line" className="flex-1 text-xs">
              Linha
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex-1 text-xs">
              Barras
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex-1 text-xs">
              Calendário
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap" className="mt-1 min-h-68.5">
            <p className="text-xs text-muted-foreground">
              Últimas 12 semanas
            </p>
            {/* <div className="flex gap-0.75">
              {habit.completions.map((day, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-0.75"
                >
                  <div
                    key={`${idx}(2)`}
                    title={day.completedDate}
                    className={`w-4 h-4 rounded-[3px] transition-colors ${
                      day ? `bg-primary` : "bg-secondary"
                    }`}
                    style={{
                      backgroundColor: day ? habit.color : "var('bg-secondary')"
                    }}
                  />
                </div>
              ))}
            </div> */}
            <div className="w-full">
              <HeatMapHabit
                counter={completion?.counter || 0}
                habitColor={habit.color || "#F9F9F9"}
                startDate={new Date(habit.startDate)}
                endDate={habit.endDate ? new Date(habit.endDate) : null}
                completions={habit.completions}
              />
            </div>
          </TabsContent>

          <TabsContent value="line" className="mt-3 min-h-68.5">
            <p className="text-xs text-muted-foreground mb-2">
              Progresso acumulado (30 dias)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData}>
                {/* <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(215 15% 15%)"
                  vertical={true}
                /> */}
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "hsl(215 20% 55%)"
                  }}
                  interval={5}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{
                    fontSize: 10,
                    fill: "hsl(215 20% 55%)"
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 41% 10%)",
                    border: "1px solid hsl(222 30% 18%)",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(210 40% 96%)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke={habit.color ?? "hsl(217 91% 60%)"}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="mt-3 min-h-68.5">
            <p className="text-xs text-muted-foreground mb-2">
              Atividades por dia
            </p>

            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={lineData}>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: 10,
                    fill: "hsl(215 20% 55%)"
                  }}
                  interval={5}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: "hsl(215 20% 55%)"
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{
                    fill: "var(--secondary)"
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(222 41% 10%)",
                    border: "1px solid hsl(222 30% 18%)",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(210 40% 96%)",
                  }}
                />

                <Bar
                  dataKey="total"
                  radius={[4,4,0,0]}
                  fill={habit.color || "hsl(217 91% 60%)"}
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="calendar" className="mt-3 flex flex-col min-h-68.5">
            <p className="text-xs text-muted-foreground mb-2">
              {new Date().toLocaleDateString(
                "pt-BR", {
                  month: "long",
                  year: "numeric"
                }
              )}
            </p>
            <div className="grid grid-cols-7 gap-2 w-fit mx-auto">
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] text-muted-foreground font-bold py-1"
                >
                  {d}
                </div>
              ))}
              {calendarData.map((cell, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedDay(cell.day)}
                  style={{
                    backgroundColor:habit.completions.find((completion) =>
                      new Date(completion.completedDate).getDate() === cell.day
                    ) && habit.color
                  }}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-medium cursor-pointer hover:bg-muted transition ${
                    habit.completions.find((completion) =>
                      new Date(completion.completedDate).getDate() === cell.day
                    )
                      ? `bg-blue-500`
                      : cell.completed
                      ? "bg-green-500 text-success-foreground"
                      : "bg-secondary text-muted-foreground"
                  } ${cell.day === new Date().getDate() ? "ring-1 ring-primary" : ""}`}
                >
                  <p className="text-foreground"> 
                    {cell.day}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto scroll-container bg-card border-border">
            <DialogHeader>
              <DialogTitle>
                Anotações do dia {selectedDay}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              {habit.completions
                .filter(
                  (completion) =>
                    new Date(completion.completedDate).getDate() === selectedDay
                ).map((completion, i) => completion.annotations && (
                  <div key={completion.id} className="flex flex-col gap-2 ">
                    <p className="text-sm">
                      {formatDate(new Date(completion.completedDate))}:
                    </p>
                    {completion.annotations?.imageUrl && completion.annotations?.imageUrl !== "" && (
                      <Image
                        width={10}
                        height={10}
                        className="w-full h-[50vh] object-cover"
                        alt="image"
                        src={completion.annotations?.imageUrl}
                      />
                    )}
                    <div
                      key={i}
                      className="p-2 rounded-md border text-sm"
                    >
                      {completion.annotations?.summary || "Sem anotação"}
                    </div>
                  </div>
                ))}

              {habit.completions.filter(
                (completion) =>
                  new Date(completion.completedDate).getDate() === selectedDay
              ).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma anotação neste dia.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </DialogContent>
    </Dialog>
  )
}