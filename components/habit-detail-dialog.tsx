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
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
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

interface HabitDetailDialogProps {
  trigger?: React.ReactNode
  currentDate: Date;
  habit: HabitWithStats | null
}

export function HabitDetailDialog({ trigger, habit, currentDate }: HabitDetailDialogProps) {
  const [open, setOpen] =
    useState<boolean>(false)

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
  console.log(completion, "completions")

  const totalCompleted = useMemo(() => {
    if (!habit) return 0;
    return Object.values(habit.completions).filter(Boolean).length;
  }, [habit]);
  console.log(totalCompleted, "total completed")

  const lineData = useMemo(() => {
    if (!habit?.completions) return [];

    const data: { date: string; total: number }[] = [];
    let cumulative = 0;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDate(d);

      const completed = habit.completions.some(
        (c) => c.completedDate === key
      );

      if (completed) cumulative++;

      data.push({
        date: `${d.getDate()}/${d.getMonth() + 1}`,
        total: cumulative,
      });
    }

    return data;
  }, [habit]);
  console.log(lineData, "Line data")

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

  const streak = useMemo(() => {
    if (!habit?.completions) return 0;

    let count = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDate(d);

      const completed = habit.completions.some(
        (c) => c.completedDate === key
      );

      if (completed) {
        count++;
      } else {
        break; // QUEBRA quando falha
      }
    }

    return count;
  }, [habit]);
  console.log(streak, "streak")

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
            <p className="text-2xl font-bold text-yellow-600">
              {streak}
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
          <TabsTrigger value="calendar" className="flex-1 text-xs">
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="mt-1">
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

        <TabsContent value="line" className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">
            Progresso acumulado (30 dias)
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData}>
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 10,
                  fill: "hsl(215 20% 55%)"
                }}
                interval={6}
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
                stroke="hsl(217 91% 60%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="calendar" className="mt-3">
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
                className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-medium ${
                  cell.day === null
                    ? ""
                    : cell.completed
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-muted-foreground"
                } ${cell.day === new Date().getDate() ? "ring-1 ring-primary" : ""}`}
              >
                {cell.day}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      </DialogContent>
    </Dialog>
  )
}

            // <div className="flex flex-col gap-4 mb-4 sm:mb-6">
            //   <div className="flex items-start justify-between gap-3">
            //     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
            //       <div
            //         className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl text-3xl sm:text-4xl shadow-lg shrink-0"
            //         style={{ backgroundColor: `${habit.color}30` }}
            //       >
            //         {habit.emoji}
            //       </div>
            //       <div className="flex-1 min-w-0">
            //         <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            //           {habit.name}
            //         </h2>
            //         {/* <p className="text-sm sm:text-base text-muted-foreground line-clamp-2">
            //           {habit.goal.name}
            //         </p> */}
            //       </div>
            //     </div>
            //   </div>

            //   <div className="flex flex-wrap items-center gap-1.5">
            //     {WEEKDAYS.map((day) => {
            //       const isActive = frequency.includes(day.key)
            //       return (
            //         <div
            //           key={day.key}
            //           className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            //             isActive ? "text-white shadow-sm" : "bg-muted/50 text-muted-foreground"
            //           }`}
            //           style={isActive ? { backgroundColor: habit.color } : {}}
            //         >
            //           {day.name}
            //         </div>
            //       )
            //     })}
            //   </div>
            // </div>
              
            // <div className="grid grid-cols-3 gap-3">
            //   <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
            //     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
            //       <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
            //         <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
            //       </div>
            //       <div className="text-xs sm:text-sm text-muted-foreground">Current</div>
            //     </div>
            //     <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
            //       {habit.current_streak}
            //     </div>
            //   </Card>

            //   <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
            //     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
            //       <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
            //         <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
            //       </div>
            //       <div className="text-xs sm:text-sm text-muted-foreground">Longest</div>
            //     </div>
            //     <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
            //       {habit.longest_streak}
            //     </div>
            //   </Card>

            //   <Card className="p-3 sm:p-4 bg-background/50 backdrop-blur border-primary/10">
            //     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 sm:mb-2">
            //       <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 w-fit">
            //         <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-primary" />
            //       </div>
            //       <div className="text-xs sm:text-sm text-muted-foreground">Sucesso</div>
            //     </div>
            //     <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: habit.color }}>
            //       {habit.completion_rate}%
            //     </div>
            //   </Card>

            // </div>

          //             <Card>
          //   <div className="flex flex-col justify-center items-center space-y-3">
          //     <Label className="font-light">"Anotações"</Label>
          //     <Image
          //       width={42}
          //       height={42}
          //       src={completion?.annotations?.imageUrl|| ""}
          //       alt="annotation"
          //     />
          //     {completion?.annotations?.summary && (
          //       <cite className="text-medium text-foreground text-sm">
          //         {completion.annotations.summary}
          //       </cite>
          //     )}
          //     {completion?.annotations?.createdAt && (
          //       <cite className="text-medium text-foreground text-sm">
          //         {new Date(completion.annotations?.createdAt).toLocaleDateString("pt-br")}
          //       </cite>
          //     )}
          //   </div>
          // </Card>

          // <Card className="p-4 sm:p-6 bg-card border-border">
          //   <div className="flex">

          //     <div className="flex flex-col items-start gap-2">
          //       <div className="flex flex-row items-center gap-2">
          //         <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          //         <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
          //           Calendário de atividades
          //         </h3>
          //       </div>
          //       <p className="text-sm text-muted-foreground">
          //         Aqui voce monitorar seu progresso com base na sua aviabilidade e hitórico de atividades.
          //       </p>
          //     </div>

          //     {/* <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          //       <Select
          //         value={displayMonth.toString()}
          //         onValueChange={(value) => setDisplayMonth(Number.parseInt(value))}
          //       >
          //         <SelectTrigger className="w-full sm:w-25">
          //           <SelectValue placeholder="Select month" />
          //         </SelectTrigger>
          //         <SelectContent>
          //           {months.map((month) => (
          //             <SelectItem key={month.value} value={month.value.toString()}>
          //               {month.label}
          //             </SelectItem>
          //           ))}
          //         </SelectContent>
          //       </Select>
          //       <Select
          //         value={displayYear.toString()}
          //         onValueChange={(value) => setDisplayYear(Number.parseInt(value))}
          //       >
          //         <SelectTrigger className="w-auto">
          //           <SelectValue placeholder="Year" />
          //         </SelectTrigger>
          //         <SelectContent>
          //           {years.map((year) => (
          //             <SelectItem key={year} value={year.toString()}>
          //               {year}
          //             </SelectItem>
          //           ))}
          //         </SelectContent>
          //       </Select>
          //     </div> */}
          //   </div>

            // <div className="overflow-x-auto">
            //   <div className="w-full">
            //     <HeatMapHabit
            //       counter={completion?.counter || 0}
            //       habitColor={habit.color || "#F9F9F9"}
            //       startDate={new Date(habit.startDate)}
            //       endDate={habit.endDate ? new Date(habit.endDate) : null}
            //       completions={habit.completions}
            //     />
            //   </div>
            // </div>
          // </Card>