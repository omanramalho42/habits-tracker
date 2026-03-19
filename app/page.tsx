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
  HabitCompletion,
  HabitSchedule,
  Routine,
  Task,
  TaskCompletion,
  TaskSchedule
} from "@prisma/client"

import { fetchTasks } from "@/services"

import CreateRoutineDialog from "@/components/create-routine-dialog"
import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"
import HabitCardRoutine from "@/components/habits/habit-card-routine"
import CreateTaskDialog from "@/components/tasks/create-task-dialog"

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
  CodeIcon,
  Filter,
  Pencil,
  Plus,
  PlusIcon,
  TargetIcon,
  Trash
} from "lucide-react"

import type { HabitWithStats } from "@/lib/types"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

import ActiveTaskCard from "@/components/tasks/active-task-card"
import ActiveTaskScheduleCard from "@/components/tasks/task-routine-card"
import HabitCardNew from "@/components/habits/habit-card-v2"
import { motion } from 'framer-motion'
import RoutineCard from "@/components/routines/routine-card-v2"

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
  const [filter, setFilter] = useState<string>("")
  
  const handleFilterHabits = (value: string) => {
    setFilter(value)
  }

  const today = new Date()

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

  const habitsFiltered: HabitWithStats[] =
    habits.filter((habit) => 
      habit.name.toLowerCase().trim().includes(filter.toLowerCase().trim()))

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
        completions: HabitCompletion[]
      }
      })[];
      taskSchedules?: (TaskSchedule & {
        task: Task & {
          completions: TaskCompletion[]
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
                      className="grid grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch mt-5 max-h-100 overflow-y-auto scroll-container"
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
                  {habits.length > 0 && (
                    <div className="flex flex-col justify-start gap-2 items-start w-full">
                      <div className="w-full flex flex-row justify-between items-center">
                        <p className="text-sm font-bold text-foreground">
                          Hábitos
                        </p>
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <CreateHabitDialog
                            trigger={
                              <Button
                                variant="outline"
                                type="button"
                                size="icon-sm"
                              >
                                <PlusIcon />
                              </Button>                          
                            }
                          />
                          <Button
                            disabled
                            variant="outline"
                            type="button"
                            size="icon-sm"
                          >
                            <Filter />
                          </Button>
                        </div>
                      </div>
                      <Input
                        type="text"
                        placeholder="pesquise pelo nome..."
                        value={filter}
                        onChange={(event) => {
                          handleFilterHabits(event.target.value)
                        }}
                      />
                    </div>
                  )}
                  {/* <ActiveCardHabits
                    habits={habits.filter((habit) => habit.name.toLowerCase().trim().includes(filter.toLowerCase().trim()))}
                    selectedDate={selectedDateStr}
                  /> */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center mt-5 max-h-100 overflow-y-auto scroll-container"
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
              )}
            </TabsContent>
            <TabsContent value="tasks" className="flex flex-col gap-2 overflow-y-visible scroll-container max-h-48">
              {tasks.length > 0 ? tasks.map((task) => {
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
      </main>
    </>
  )
}
