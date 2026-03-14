"use client"

import {  useState } from "react"

import dynamic from "next/dynamic"

import {  useQuery } from "@tanstack/react-query"

import { fetchRoutines } from "@/services/routines"
import { fetchHabits } from "@/services/habits"

import ActiveCardHabits from "@/components/habits/active-card-habits"
import CurrentSectionDate from "@/components/habits/current-section-date"

const HeaderSection =
  dynamic(() => import("@/components/habits/header-section"), {
    loading: () => <Skeleton />
  })

import type {
  Habit,
  HabitSchedule,
  Routine,
  Task
} from "@prisma/client"

import Footer from "@/components/habits/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CreateRoutineDialog from "@/components/create-routine-dialog"
import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

import { Skeleton } from "@/components/ui/skeleton"

import {
  AppWindowIcon,
  CodeIcon,
  Edit,
  Filter,
  Pencil,
  Plus,
  TargetIcon,
  Trash
} from "lucide-react"

import type { HabitWithStats } from "@/lib/types"

import { formatDateBR } from "@/lib/utils"
import HabitCardRoutine from "@/components/habits/habit-card-routine"
import ActiveTaskCard from "@/components/tasks/active-task-card"
import { fetchTasks } from "@/services"

export default function Home() {
  const [filter, setFilter] = useState<string>("")
  
  const handleFilterHabits = (value: string) => {
    setFilter(value)
  }

  const today = new Date()
  // today.setHours(0, 0, 0, 0)

  const [selectedDate, setSelectedDate] =
    useState(today)
  const selectedDateStr =
    formatDateBR(selectedDate)

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
    data: tasks = [],
  } = useQuery<Task[]>({
    queryKey: ["tasks", selectedDateStr],
    queryFn: () => fetchTasks(selectedDateStr),
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

  return (
    <>
      {/* <MoodWizard /> */}

      <main className="min-h-screen bg-background">
        <div className="flex flex-col space-y-2 max-w-5xl mx-auto px-4 py-1">

          {/* HEADER + ACTIONS BUTTONS */}
          <HeaderSection />
          {/* CURRENT SELECTION DATE */}
          <CurrentSectionDate
            selectedDate={selectedDate}
            onSuccessCallback={setSelectedDate}
          />

          <Tabs defaultValue="habits">
            <TabsList className="w-full my-10" >
              <TabsTrigger value="routines">
                <AppWindowIcon />
                Rotinas
              </TabsTrigger>
              <TabsTrigger value="habits">
                <CodeIcon />
                Hábitos
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <TargetIcon />
                Tarefas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="routines">
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
                          ? routine.habitSchedules?.map((schedule) => (
                            <HabitCardRoutine
                              key={schedule.id}
                              selectedDate={selectedDate}
                              schedule={schedule}
                            />
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
            </TabsContent>
            <TabsContent value="habits">
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
                <div className="w-full flex flex-col">
                  <div className="flex flex-row justify-between gap-2 items-center w-full">
                    <p className="text-sm font-bold text-foreground">
                      Hábitos
                    </p>
                    <div className="flex flex-row gap-2 w-full items-center justify-center">
                      <Input
                        type="text"
                        placeholder="pesquise pelo nome."
                        value={filter}
                        onChange={(event) => {
                          handleFilterHabits(event.target.value)
                        }}
                      />
                    </div>
                    <Button
                      variant="outline"
                      type="button"
                      size="icon-lg"
                    >
                      <Filter />
                    </Button>
                  </div>
                  <ActiveCardHabits
                    habits={habits.filter((habit) => habit.name.toLowerCase().trim().includes(filter.toLowerCase().trim()))}
                    selectedDate={selectedDate}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="tasks" className="flex flex-col gap-2 overflow-y-visible scroll-container max-h-48">
              {tasks.map((task) => {
                return (
                  <ActiveTaskCard
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                  />
                )
              })}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </main>
    </>
  )
}
