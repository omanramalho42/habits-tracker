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
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react"
import Image from "next/image"

interface HabitDetailDialogProps {
  trigger?: React.ReactNode
  currentDate: Date;
  habit: HabitWithStats | null
}

export function HabitDetailDialog({ trigger, habit, currentDate }: HabitDetailDialogProps) {
  const [date, setDate] =
    useState(currentDate)
  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))
  }
  const formatDateKey = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")

    return `${y}-${m}-${d}`
  }
  const isToday = (day: number) => {
    const today = new Date()

    return (
      day === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }
  const [open, setOpen] =
    useState<boolean>(false)
    const [selectedDay, setSelectedDay] = useState<number | null>(null)

    // const habitName = useMemo(() => {
    //   return habit?.name
    // }, [habit])

    // const habitCategory = useMemo(() => {
    //   return habit?.category
    // }, [habit])

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

  // const heatMapData = useMemo(() => {
  //   if (!habit?.completions) return [];

  //   const weeks: { date: Date; completed: boolean }[][] = [];
  //   const today = new Date();
  //   const start = new Date(today);

  //   start.setDate(start.getDate() - 83);
  //   start.setDate(start.getDate() - start.getDay());

  //   let currentWeek: { date: Date; completed: boolean }[] = [];
  //   const d = new Date(start);

  //   while (d <= today) {
  //     const key = formatDate(d);

  //     const completed = habit.completions.some(
  //       (c) => c.completedDate === key
  //     );

  //     currentWeek.push({
  //       date: new Date(d),
  //       completed,
  //     });

  //     if (currentWeek.length === 7) {
  //       weeks.push(currentWeek);
  //       currentWeek = [];
  //     }

  //     d.setDate(d.getDate() + 1);
  //   }

  //   if (currentWeek.length > 0) weeks.push(currentWeek);

  //   return weeks;
  // }, [habit]);
  // console.log(heatMapData, "HEAT MAP DATA!")

// Gera os dias do calendário dinamicamente sempre que o mês muda
  const calendarData = useMemo(() => {
    if (!habit?.completions) return []

    const year = date.getFullYear()
    const month = date.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells: {
      day: number | null
      completed: boolean
    }[] = []

    // espaços antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null, completed: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d)
      const key = formatDateKey(cellDate)

      const completed = habit.completions.some(
        (c) => c.completedDate === key
      )

      cells.push({
        day: d,
        completed
      })
    }

    return cells
  }, [habit?.completions, date])

  // Verifica se o hábito foi completado naquele dia exato
  const isHabitCompleted = (day: any) => {
    if (!day || !habit?.completions) return false;
    
    return habit.completions.some((completion) => {
      const compDate = new Date(completion.completedDate);
      return (
        compDate.getDate() === day &&
        compDate.getMonth() === date.getMonth() &&
        compDate.getFullYear() === date.getFullYear()
      );
    });
  }

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
        className="max-w-lg max-h-[95vh] overflow-y-auto bg-card border-border scroll-container"
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

        <div className="grid grid-cols-3 gap-3 mt-1">
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

        <div className="mt-1">
          <p className="text-xs text-muted-foreground mb-1">
            Frequência: semanalmente
          </p>
          <div className="flex gap-1">
            {WEEKDAYS.map((day) => {
              const isActive = frequency.some(
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

        <Tabs defaultValue="heatmap" className="mt-1">

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

          <TabsContent value="calendar" className="mt-1 flex flex-col min-h-68.5">
            
            {/* Cabeçalho de Navegação */}
            <div className="flex items-center justify-between mb-1 w-full max-w-55 mx-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevMonth} 
                className="p-1 hover:bg-muted rounded-md text-muted-foreground transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <p className="text-xs text-muted-foreground font-medium capitalize">
                {date.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric"
                })}
              </p>

              <Button
                type="button"
                variant="ghost"
                onClick={handleNextMonth} 
                className="p-1 hover:bg-muted rounded-md text-muted-foreground transition"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Grid do Calendário */}
            <div className="grid grid-cols-7 gap-2 w-fit mx-auto">
              {/* Dias da Semana */}
              {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
                <div
                  key={`weekday-${i}`}
                  className="text-center text-[10px] text-muted-foreground font-bold py-1"
                >
                  {d}
                </div>
              ))}
              
              {/* Dias do Mês */}
              {calendarData.map((cell, i) => {
                // Se for um espaço vazio (antes do dia 1)
                if (!cell.day) {
                  return <div key={`empty-${i}`} className="w-8 h-8" />;
                }

                const completed = isHabitCompleted(cell.day);

                return (
                  <div
                    key={`day-${cell.day}`}
                    onClick={() => setSelectedDay(cell.day)} // Sugestão: talvez você precise passar a data completa aqui futuramente
                    style={{
                      backgroundColor: completed ? habit.color : undefined
                    }}
                    className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-medium cursor-pointer hover:bg-muted transition ${
                      completed
                        ? `bg-blue-500` // Cor de fallback caso habit.color não exista
                        : cell.completed // Mantive do seu código original
                        ? "bg-green-500 text-success-foreground"
                        : "bg-secondary text-muted-foreground"
                    } ${isToday(cell.day) ? "ring-1 ring-primary" : ""}`}
                  >
                    <p className={completed ? "text-white" : "text-foreground"}> 
                      {cell.day}
                    </p>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* ANNOTATIONS */}
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
                )
                .filter((completion) => completion.annotations)
                .map((completion, i) => (
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
              ).filter((completion) => completion.annotations).length === 0 && (
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