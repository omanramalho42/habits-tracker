"use client"

import { useEffect, useState } from "react"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { fetchHabits } from "@/services/habits"

// import { MoodWizard } from "@/components/mood-wizard"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ActiveCardHabits from "@/components/habits/active-card-habits"
import CurrentSectionDate from "@/components/habits/current-section-date"
import HeaderSection from "@/components/habits/header-section"

import type { HabitWithStats } from "@/lib/types"
// import { DndContext, useDraggable } from "@dnd-kit/core"
import Footer from "@/components/habits/footer"
import { fetchRoutines } from "@/services/routines"
import { Habit, HabitSchedule, Routine } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AlarmClock, Check, Clock, Clock10, Edit, Filter, MoreHorizontal, Pencil, Plus, Trash } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import CreateRoutineDialog from "@/components/create-routine-dialog"
import RemoveHabitRoutineDialog from "@/components/remove-habit-routine-dialog"
import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"
import UpdateRoutineHabitSchedule from "@/components/update-routine-habit-schedule-dialog"
import axios from "axios"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

export default function Home() {
  const [filter, setFilter] = useState<string>("")
  
  const handleFilterHabits = (value: string) => {
    setFilter(value)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // const newToday = new Intl.DateTimeFormat('pt-BR', {
  //   timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit'
  // }).format(today)
  
  const [selectedDate, setSelectedDate] = useState(today)

  const selectedDateStr =
    selectedDate.toISOString().split("T")[0]

  const {
    data: habits = [],
    isLoading,
    isError,
    error
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits", selectedDateStr],
    queryFn: () => fetchHabits(selectedDateStr),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: routines = [],
  } = useQuery<(Routine & { habitSchedules?: (HabitSchedule & { habit?: Habit })[] })[]>({
    queryKey: ["routines", selectedDateStr],
    queryFn: () => fetchRoutines(selectedDateStr),
    staleTime: 1000 * 60,
    retry: 1,
  })

  console.log(routines, "routines");

  const toggleHabit = async (values: { habitId: string; date: string }) => {
    const { data } = await axios.post(`/api/habits/${values.habitId}/toggle`, {
      date: values.date
    })

    return data
  }

  const queryClient = useQueryClient()
  const { mutate: toggleHabitMutation } = useMutation({
    mutationFn: toggleHabit,
    onSuccess: () => {
      toast.success(
        "Status do hábito de rotina alterado com sucesso...", {
          id: `toggle-habit`,
      })
      queryClient.invalidateQueries({
        queryKey: ["habits"]
      })
    },
    onError: () => {
      toast.error(
        "Ocorreu um erro ao alterar o status do hábito de rotina...", {
          id: `toggle-habit`,
      })
    }
  })

  const handleToggleHabit = (habitId: string, date: Date) => {
    toast.loading(
      "Alterando status do hábito de rotina...", {
        id: `toggle-habit`,
    })
    date.setHours(0,0,0,0)

    toggleHabitMutation({
      habitId,
      date: date.toISOString(),
    })
  }

  const completedToday = habits.reduce((total, habit) => {
    const completed = habit.completions?.some(
      (c) =>
        new Date(c.completedDate).toISOString().split("T")[0] ===
        new Date(selectedDate).toISOString().split("T")[0]
    )

    return completed ? total + 1 : total
  }, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto" />
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 bg-primary/10 mx-auto blur-xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Wisey
          </h2>
          <p className="text-muted-foreground">
            Carregando seus hábitos...
          </p>
        </div>
      </div>
    )
  }

  const sumTime = (clock?: string, duration?: string) => {
    if (!clock || !duration) return null

    const [h1, m1] = clock.split(":").map(Number)
    const [h2, m2] = duration.split(":").map(Number)

    const totalMinutes = (h1 * 60 + m1) + (h2 * 60 + m2)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  return (
    <>
      {/* <MoodWizard /> */}

      <main className="min-h-screen bg-background">
        <div className="flex flex-col space-y-6 max-w-5xl mx-auto px-4 py-8">

          {/* HEADER + ACTIONS BUTTONS */}
          <HeaderSection />
          {/* CURRENT SELECTION DATE */}
          <CurrentSectionDate
            selectedDate={selectedDate}
            onSuccessCallback={setSelectedDate}
          />

          <p className="text-sm">
            Rotinas do dia
          </p>
          <div className="flex flex-col gap-4 max-h-100 overflow-auto scroll-container">
            {routines.length > 0 ? (
              routines.map((routine, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 px-2"
                >

                  {/* HEADER */}
                  <div className="flex flex-col items-start gap-2 justify-start w-full my-2">
                    <div className="flex flex-row items-center justify-between w-full">

                      <div className="flex flex-col justify-start items-start">
                        <p className="text-sm font-bold text-foreground">
                          {routine.emoji} - {routine.name}
                        </p>
                        {/* <p className="text-sm font-medium text-foreground">
                          {routine.updatedAt}
                        </p> */}
                      </div>

                      <div className="flex flex-row gap-2">
                        <UpdateRoutineDialog
                          routine={routine}
                          trigger={
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          }
                        />
                        <DeleteRoutineDialog
                          routineId={routine.id}
                          trigger={
                            <Button
                              variant="ghost"
                              type="button"
                              size="icon-sm"
                            >
                              <Trash className="w-3 h-3" />
                            </Button>
                          }
                        />
                      </div>

                    </div>

                    <div className="flex w-full flex-row justify-between gap-2">
                      <Input
                        className="w-full"
                        type="text"
                        placeholder="Pesquise pelo nome..."
                        value={filter}
                        onChange={(event) =>
                          handleFilterHabits(event.target.value)
                        }
                      />

                      <Button
                        variant="outline"
                        type="button"
                        size="icon-lg"
                      >
                        <Filter />
                      </Button>
                    </div>
                  </div>

                  {/* ROUTINES LIST */}
                  <div
                    className="flex flex-col gap-3 max-h-75 overflow-auto scroll-container"
                    aria-selected={false}
                  >
                    {routine.habitSchedules && routine?.habitSchedules?.length > 0 
                      ? routine.habitSchedules?.map((item) => (
                      <Card
                        key={item.id}
                        className="p-4 hover:border-primary/40 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">

                          {/* ICON */}
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                            <span className="text-lg">
                              {item?.habit?.emoji}
                            </span>
                          </div>

                          {/* CONTENT */}
                          <div className="flex flex-col flex-1">

                            {/* TIME INFO */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">

                              {item?.clock && (
                                <div className="flex flex-row items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <Clock10 className="w-3.5 h-3.5" />
                                    <span>{item.clock.slice(0,5)}</span>
                                  </div>

                                  <span className="opacity-40">+</span>
                                </div>
                              )}

                              {item?.duration && (
                                <div className="flex flex-row items-center gap-3">
                                  <div className="flex items-center gap-1">
                                    <AlarmClock className="w-3.5 h-3.5" />
                                    <span>{item.duration.slice(0,5)}</span>
                                  </div>

                                  <span className="opacity-40">→</span>
                                </div>
                              )}

                              {item.clock && item.duration && sumTime(item?.clock, item?.duration) && (
                                <div className="flex text-orange-400 items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{sumTime(item?.clock, item?.duration)}</span>
                                </div>
                              )}

                            </div>

                            {/* TITLE */}

                            <div className="flex flex-row justify-between gap-2 items-center">
                              <p
                                className={`text-sm font-medium ${
                                  completedToday
                                    ? "line-through text-muted-foreground opacity-60"
                                    : "text-foreground"
                                }`}
                              >
                                {item?.habit?.name}
                              </p>
                              <div className="flex flex-row items-center gap-1">
                                <Button
                                  variant={completedToday ? "default" : "outline"}
                                  size="icon-sm"
                                  disabled={isLoading || !item.habit?.id}
                                  onClick={() => item.habit?.id && handleToggleHabit(item.habit.id, selectedDate)}
                                  className={cn(
                                    "relative w-5 h-5 rounded-full flex items-center justify-center transition",
                                    completedToday
                                      ? `bg-primary text-white`
                                      : "bg-background border border-border"
                                  )}
                                >
                                  {completedToday && <Check className="w-5 h-5" />}
                                </Button>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      type="button"
                                      size="icon-sm"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuGroup>
                                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                      <RemoveHabitRoutineDialog
                                        habitScheduleId={item.id}
                                        routineId={routine.id}
                                        trigger={
                                          <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                          >
                                            <Button variant="ghost" type="button" size="icon">
                                              <Trash className="h-3 w-3" />
                                            </Button>
                                            Remover
                                          </DropdownMenuItem>
                                        }
                                      />
                                      {item.habit && (
                                        <UpdateRoutineHabitSchedule
                                          habit={item.habit}
                                          schedule={item}
                                          trigger={
                                            <DropdownMenuItem
                                              onSelect={(e) => e.preventDefault()}
                                            >
                                              <Button
                                                disabled
                                                variant="ghost"
                                                type="button"
                                                size="icon-sm"
                                              >
                                                <Pencil className="h-3 w-3" />
                                              </Button>
                                              Editar
                                            </DropdownMenuItem>
                                          }
                                        />
                                      )}
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem disabled>API</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                          
                        </div>
                      </Card>
                    )) : (
                      <Card className="flex flex-row justify-center gap-4 items-center">
                        <Edit className="w-8 h-8" />
                        <p>
                          Editar hábito
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20">

                <div className="text-7xl mb-6">🎯</div>

                <h2 className="text-2xl font-bold mb-3 text-foreground">
                  Comece sua jornada
                </h2>

                <CreateRoutineDialog
                  trigger={
                    <Button
                      aria-label="Criar rotina"
                      title="Criar rotina"
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Criar rotina
                    </Button>
                  }
                />

              </div>
            )}

          </div>
          
          {isError ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Não foi possível carregar hábitos
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : "Tente novamente em instantes."}
              </p>
            </div>
          ) : (
            <ActiveCardHabits
              habits={habits}
              selectedDate={selectedDate}
            />
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}
