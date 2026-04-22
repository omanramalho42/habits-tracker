"use client"

import {  useState } from "react"

import { useTheme } from "next-themes"

import dynamic from "next/dynamic"

import { motion } from 'framer-motion'

import {  useQuery } from "@tanstack/react-query"

import { fetchRoutines } from "@/services/routines"
import { fetchHabits } from "@/services/habits"
import { fetchTasks } from "@/services"

import CurrentSectionDate from "@/components/habits/current-section-date"

const HeaderSection =
  dynamic(() => import("@/components/habits/header-section"), {
    loading: () => <Skeleton />
  })

import type {
  Categories,
  Counter,
  Habit,
  HabitCompletion,
  HabitSchedule,
  Routine,
  Task,
  TaskCompletion,
  TaskSchedule,
  User,
  UserSettings
} from "@prisma/client"

import TimezoneWarningBanner from "@/components/banners/timezone-warning-banner"
import CreateFeedbackDialog from "@/components/feedback/create-feedback-dialog"
import { BottomNavigation } from "@/components/routines/bottom-navigation"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import CreateRoutineDialog from "@/components/create-routine-dialog"
import CreateTaskDialog from "@/components/tasks/create-task-dialog"
import ActiveTaskCard from "@/components/tasks/active-task-card"
import HabitCardNew from "@/components/habits/habit-card-v2"
import RoutineCard from "@/components/routines/routine-card-v2"

import Footer from "@/components/habits/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"

import { Skeleton } from "@/components/ui/skeleton"

import { formatDateBR } from "@/lib/utils"

import {
  AppWindowIcon,
  Check,
  CodeIcon,
  Filter,
  Plus,
  TargetIcon,
} from "lucide-react"

import type { HabitWithStats } from "@/lib/types"
import MultiGraphsChart from "@/components/charts/multi-graphs-chart"
import { fetchUserSettings } from "@/services/settings"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08, // delay entre itens
    },
  },
}
const item = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
}

export default function Home() {
  const [search, setSearch] = useState<string>("")
  const [filter, setFilter] = useState<{
    status: "all" | "completed" | "pending"
    sortBy: "createdAt" | "updatedAt" | "name"
    order: "asc" | "desc"
  }>({
    status: "all",
    sortBy: "createdAt",
    order: "desc"
  })
  const { theme, setTheme } = useTheme()
  
  const handleFilterHabits = (value: string) => {
    setSearch(value)
  }

  const today = new Date()

  const [selectedDate, setSelectedDate] =
    useState(today)
  const selectedDateStr =
    formatDateBR(selectedDate)

  const {
    data: userSettings,
  } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })

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
  const applyStatus = (status: "all" | "completed" | "pending") => {
    setFilter((prev) => ({ ...prev, status }))
  }

  const applySort = (sortBy: "createdAt" | "updatedAt" | "name") => {
    setFilter((prev) => ({ ...prev, sortBy }))
  }

  const applyOrder = (order: "asc" | "desc") => {
    setFilter((prev) => ({ ...prev, order }))
  }

  const resetFilter = () => {
    setFilter({
      status: "all",
      sortBy: "createdAt",
      order: "desc"
    })
  }
  const isCompletedOnSelectedDate = (habit: HabitWithStats) => {
    return habit.completions?.some((c) =>
      c.completedDate.startsWith(selectedDateStr)
    )
  }
  const isActive = (type: string, value: string) => {
    return filter[type as keyof typeof filter] === value
  }
  const habitsFiltered = habits
    // 🔎 busca
    .filter((habit) =>
      habit.name.toLowerCase().includes(search.toLowerCase())
    )

    .filter((habit) => {
      if (filter.status === "completed") {
        return isCompletedOnSelectedDate(habit)
      }

      if (filter.status === "pending") {
        return !isCompletedOnSelectedDate(habit)
      }

      return true
    })

    // 📊 ordenação
    .sort((a, b) => {
      let comparison = 0

      if (filter.sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      }

      if (filter.sortBy === "createdAt") {
        comparison =
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      }

      if (filter.sortBy === "updatedAt") {
        comparison =
          new Date(a.updatedAt ?? a.createdAt).getTime() -
          new Date(b.updatedAt ?? b.createdAt).getTime()
      }

      return filter.order === "asc" ? comparison : -comparison
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
  } = useQuery
  <
    (Routine & {
      habitSchedules?: (HabitSchedule & {
      habit: Habit & {
        completions: HabitCompletion[],
        categories: Categories[],
      }
      })[];
      taskSchedules?: (TaskSchedule & {
        task: Task & {
          completions: (TaskCompletion & {
            counter: Counter
          })[],
          categories: Categories[],
        }
      })[]
    })[]
  >
  ({
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
      <main className="min-h-screen">
        <div className="flex flex-col space-y-2 max-w-5xl mx-auto px-4 py-1">
          <HeaderSection />
          <CurrentSectionDate
            selectedDate={selectedDate}
            onSuccessCallback={setSelectedDate}
          />
          {userSettings?.showGraphs && (
            <MultiGraphsChart tasks={tasks} />
          )}

          <Tabs defaultValue="habits">
            <TabsList className="bg-background w-full my-2">
              <TabsTrigger 
                value="routines" 
                className="flex items-center gap-2 rounded-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-[0_4px_20px_-5px_rgba(34,197,94,0.8)] transition-all"
              >
                <AppWindowIcon className="w-4 h-4" />
                Rotinas
              </TabsTrigger>

              <TabsTrigger 
                value="habits" 
                className="flex items-center gap-2 rounded-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-[0_4px_20px_-5px_rgba(34,197,94,0.8)] transition-all"
              >
                <CodeIcon className="w-4 h-4" />
                Hábitos
              </TabsTrigger>

              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-2 rounded-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-[0_4px_20px_-5px_rgba(34,197,94,0.8)] transition-all"
              >
                <TargetIcon className="w-4 h-4" />
                Tarefas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="routines" className="">
              <div className="flex flex-col gap-4">
                {routines.length > 0 ? (
                  <div className="">
                    <p className="text-sm">
                      Rotinas do dia
                    </p>
                    <motion.div
                      variants={container}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch mt-5 max-h-180 overflow-y-auto scroll-container"
                    >
                      {routines.map((routine, index) => (
                        <motion.div
                          key={routine.id}
                          initial={{ opacity: 0, y: 30, scale: 0.98 }}
                          whileInView={{ opacity: 1, y: 0, scale: 1 }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{
                            duration: 0.4,
                            delay: index * 0.05,
                            ease: "easeOut",
                          }}
                        >
                          <RoutineCard
                            routine={routine}
                            selectedDate={selectedDateStr}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                ) : (
                  <Card className="flex flex-col gap-1 px-4">
                    <div className="flex flex-col text-center text-4xl">
                      🎯
                      <h2 className="text-center text-xl font-bold mb-3 text-foreground">
                        Comece sua jornada
                      </h2>
                    </div>
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
                  </Card>
                )}

              </div>
            </TabsContent>
            <TabsContent value="habits">
              {isError ? (
                <div className="text-center py-10">
                  <h2 className="text-2xl font-bold mb-3 text-foreground">
                    Não foi possível carregar hábitos
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {error instanceof Error ? error.message : "Tente novamente em instantes."}
                  </p>
                </div>
              ) : (
                <div className="w-full flex flex-col">
                  {habitsFiltered.length > 0 ? (
                    <div className="flex flex-col justify-start gap-2 items-start w-full">
                      <div className="w-full flex flex-row justify-between items-center">
                        <p className="text-sm font-bold text-foreground">
                          Hábitos
                        </p>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              type="button"
                              size="icon-sm"
                              className="
                                border-white/10 bg-black/40 backdrop-blur-md
                                hover:bg-green-500/10 hover:border-green-500/30
                                shadow-[0_0_10px_rgba(34,197,94,0.15)]
                              "
                            >
                              <Filter className="w-4 h-4 text-green-400" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-56 bg-black/80 backdrop-blur-xl border border-white/10"
                          >

                            {/* STATUS */}
                            <DropdownMenuLabel>Status</DropdownMenuLabel>

                            {[
                              { label: "Todos", value: "all" },
                              { label: "✔️ Completados", value: "completed" },
                              { label: "⏳ Pendentes", value: "pending" }
                            ].map((item) => (
                              <DropdownMenuItem
                                key={item.value}
                                onClick={() => applyStatus(item.value as any)}
                                className="flex justify-between"
                              >
                                {item.label}

                                {isActive("status", item.value) && (
                                  <Check className="w-4 h-4 text-green-400" />
                                )}
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />

                            {/* ORDENAÇÃO */}
                            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>

                            {[
                              { label: "🆕 Criação", value: "createdAt" },
                              { label: "✏️ Edição", value: "updatedAt" },
                              { label: "🔤 Nome", value: "name" }
                            ].map((item) => (
                              <DropdownMenuItem
                                key={item.value}
                                onClick={() => applySort(item.value as any)}
                                className="flex justify-between"
                              >
                                {item.label}

                                {isActive("sortBy", item.value) && (
                                  <Check className="w-4 h-4 text-green-400" />
                                )}
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />

                            {/* ORDEM */}
                            <DropdownMenuLabel>Ordem</DropdownMenuLabel>

                            {[
                              { label: "⬆️ Ascendente", value: "asc" },
                              { label: "⬇️ Descendente", value: "desc" }
                            ].map((item) => (
                              <DropdownMenuItem
                                key={item.value}
                                onClick={() => applyOrder(item.value as any)}
                                className="flex justify-between"
                              >
                                {item.label}

                                {isActive("order", item.value) && (
                                  <Check className="w-4 h-4 text-green-400" />
                                )}
                              </DropdownMenuItem>
                            ))}

                            <DropdownMenuSeparator />

                            {/* RESET */}
                            <DropdownMenuItem
                              onClick={resetFilter}
                              className="text-red-400"
                            >
                              Limpar filtros
                            </DropdownMenuItem>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Input
                        type="text"
                        placeholder="pesquise pelo nome..."
                        value={search}
                        style={{
                          backgroundColor: 'var(--card)'
                        }}
                        onChange={(event) => {
                          handleFilterHabits(event.target.value)
                        }}
                      />

                      <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid w-full grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center mt-5 max-h-135 overflow-y-auto scroll-container"
                      >
                        {habitsFiltered.map((habit, index) => (
                          <motion.div
                            key={habit.id}
                            initial={{ opacity: 0, y: 30, scale: 0.98 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                              duration: 0.4,
                              delay: index * 0.05,
                              ease: "easeOut",
                            }}
                          >
                            <HabitCardNew
                              selectedDate={selectedDateStr}
                              habit={habit}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  ) : (
                    <Card className="flex flex-col gap-1 px-4">
                      <div className="flex flex-col text-center text-4xl">
                        🎯
                        <h2 className="text-center text-xl font-bold mb-3 text-foreground">
                          Comece sua jornada
                        </h2>
                      </div>
                      <CreateHabitDialog
                        trigger={
                          <Button
                            aria-label="Criar hábito"
                            title="Criar hábito"
                            size="lg"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Criar Hábito
                          </Button>
                        }
                      />
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="tasks" className="flex flex-col gap-2 overflow-y-visible scroll-container max-h-190">
              {tasks?.length > 0 ? tasks?.map((task) => {
                return (
                  <ActiveTaskCard
                    key={task.id}
                    task={task}
                    selectedDate={selectedDate}
                  />
                )
              }) : (
                <Card className="flex flex-col gap-1 px-4">
                  <div className="flex flex-col text-center text-4xl">
                    🎯
                    <h2 className="text-center text-xl font-bold mb-3 text-foreground">
                      Comece sua jornada
                    </h2>
                  </div>
                  <CreateTaskDialog
                    trigger={
                      <Button
                        aria-label="Criar tarefa"
                        title="Criar tarefa"
                        size="lg"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Criar tarefa
                      </Button>
                    }
                  />
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />

        <TimezoneWarningBanner />
        <CreateFeedbackDialog
          trigger={
            <Button
              className="fixed z-10 opacity-75 bottom-30 right-10"
              variant="default"
              role="button"
              type="button"
              size="icon-lg"
            >
              <p>✨</p>
            </Button>
          }
        />
        {/* <BottomNavigation /> */}
      </main>
    </>
  )
}
