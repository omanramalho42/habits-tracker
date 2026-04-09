"use client"

import React, { useMemo, useState } from "react"
import axios from "axios"
import confetti from "canvas-confetti"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"
import UpdateHabitSchedule  from "@/components/update-habit-schedule-dialog"
import DeleteHabitScheduleDialog from "@/components/delete-habit-schedule-dialog"
import UpdateTaskScheduleDialog from "@/components/task-schedule/update-task-schedule-dialog"
import DeleteTaskScheduleDialog from "@/components/task-schedule/delete-task-schedule-dialog"
import RoutineFrequencyCard from "@/components/routines/routine-frequency"
import RoutineCronCard from "@/components/routines/routine-card-cron"
import FilterDropdown from "@/components/routines/filter-dropdown"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

import { cn } from "@/lib/utils"

import {
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  MoreHorizontal,
  Trash,
  Clock,
  AlarmCheck,
  CheckCircle2,
  Plus,
  ArrowRight,
  PlusCircle,
} from "lucide-react"

import type {
  HabitCompletion,
  HabitSchedule,
  Routine,
  Task,
  TaskCompletion,
  Habit,
  TaskSchedule,
  Categories,
  Counter,
  CounterStep,
  // Goals
} from "@prisma/client"

interface RoutineCardProps {
  routine: (Routine & {
    habitSchedules?: (HabitSchedule & {
      habit: Habit & {
        completions: (HabitCompletion & {
          counterStep?: CounterStep[]
        })[]
        categories: Categories []
        // goals:      Goals[]
      }
    })[];
    taskSchedules?: (TaskSchedule & {
      task: Task & {
        completions: (TaskCompletion & {
          counterStep?: CounterStep[]
        })[]
        categories: Categories []
      }
    })[]
  })
  selectedDate: string
}

type FilterField = "name" | "status" | "category" | "type"
type SortField = "createdAt" | "updatedAt" | "name"
type SortOrder = "asc" | "desc"

type FilterState = {
  field: FilterField
  values: string[]

  // 🔥 NOVO
  sortBy?: SortField
  order?: SortOrder
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  selectedDate
}) => {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterState>({
    field: "name",
    values: []
  })
  
  const queryClient = useQueryClient()

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const filteredHabits = useMemo(() => {
    if (!routine.habitSchedules) return []

    let data = routine.habitSchedules.filter((schedule) => {
      const habit = schedule.habit
      if (!habit) return false

      const searchMatch =
        !search ||
        normalize(habit.name).includes(normalize(search)) ||
        normalize(habit.emoji || "").includes(normalize(search)) ||
        habit.categories?.some((cat: any) =>
          normalize(cat.name).includes(normalize(search))
        )

      let filterMatch = true

      if (filter.values.length > 0) {
        if (filter.field === "category") {
          filterMatch = habit.categories?.some((cat: any) =>
            filter.values.includes(cat.name)
          )
        }

        if (filter.field === "status") {
          filterMatch = filter.values.includes(habit.status)
        }
      }

      return searchMatch && filterMatch
    })

    // 🔥 SORT
    if (filter.sortBy) {
      data = data.sort((a, b) => {
        const A = a.habit
        const B = b.habit
        if (!A || !B) return 0

        let valueA: any
        let valueB: any

        switch (filter.sortBy) {
          case "createdAt":
            valueA = new Date(A.createdAt).getTime()
            valueB = new Date(B.createdAt).getTime()
            break
          case "updatedAt":
            valueA = new Date(A.updatedAt || 0).getTime()
            valueB = new Date(B.updatedAt || 0).getTime()
            break
          case "name":
            valueA = A.name.toLowerCase()
            valueB = B.name.toLowerCase()
            break
        }

        if (valueA < valueB) return filter.order === "asc" ? -1 : 1
        if (valueA > valueB) return filter.order === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [routine.habitSchedules, search, filter])

  const filteredTasks = useMemo(() => {
    if (!routine.taskSchedules) return []

    console.log(routine.taskSchedules, "task schedules ⏳");

    let data = routine.taskSchedules.filter((schedule) => {
      const task = schedule.task
      if (!task) return false

      const searchMatch =
        !search ||
        normalize(task.name).includes(normalize(search)) ||
        normalize(task.description || "").includes(normalize(search))

      let filterMatch = true

      if (filter.values.length > 0) {
        if (filter.field === "category") {
          filterMatch = task.categories?.some((cat: any) =>
            filter.values.includes(cat.name)
          )
        }

        if (filter.field === "status") {
          filterMatch = filter.values.includes(task.status)
        }
      }

      return searchMatch && filterMatch
    })

    // 🔥 SORT
    if (filter.sortBy) {
      data = data.sort((a, b) => {
        const A = a.task
        const B = b.task
        if (!A || !B) return 0

        let valueA: any
        let valueB: any

        switch (filter.sortBy) {
          case "createdAt":
            valueA = new Date(A.createdAt).getTime()
            valueB = new Date(B.createdAt).getTime()
            break
          case "updatedAt":
            valueA = new Date(A.updatedAt || 0).getTime()
            valueB = new Date(B.updatedAt || 0).getTime()
            break
          case "name":
            valueA = A.name.toLowerCase()
            valueB = B.name.toLowerCase()
            break
        }

        if (valueA < valueB) return filter.order === "asc" ? -1 : 1
        if (valueA > valueB) return filter.order === "asc" ? 1 : -1
        return 0
      })
    }

    return data
  }, [routine.taskSchedules, search, filter])

  const {
    mutate: mutateHabit,
    isPending: isPendingHabit
  } = useMutation({
    mutationFn: async ({ habitId }: { habitId: string }) => {
      const res = await axios.put(`/api/habits/${habitId}`, {
        date: selectedDate
      })
      return res.data
    },
    onSuccess: async (values) => {
      await queryClient.invalidateQueries({
        queryKey: ["routines"]
      })
      await queryClient.invalidateQueries({
        queryKey: ["habits"]
      })

      if (values.counter === values?.completion?.habit?.limitCounter) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        })
      }

      toast.success("Hábito atualizado", {
        id: "toggle-habit"
      })
    },
    onError: () => {
      toast.error("Erro ao atualizar hábito", {
        id: "toggle-habit"
      })
    }
  })

  const handleToggleHabit = (habitId: string) => {
    toast.loading("Atualizando hábito...", {
      id: "toggle-habit"
    })
    mutateHabit({ habitId })
  }

  const {
    mutate: mutateTask,
    isPending: isPendingTask
  } = useMutation({
    mutationFn: async ({
      taskId,
      date
    }: {
      taskId: string
      date: string
    }) => {
      const response =
        await axios.put(`/api/task/${taskId}`, {
          date,
        })
      return response.data
    },
    onSuccess: async (values) => {
      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines"],
      })
      if(values.isCompleted) {
        console.log(values, 'values')
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }

      toast.success(
        "Sucesso ao alterar o status da tarefa...",
        { id: 'toggle-task' }
      )
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-task",
      })
    },
  })

  const handleToggleTask = (taskId: string, date: string) => {
    toast.loading(
      "Alterando status da terafa...", {
        id: `toggle-task`,
    })
    mutateTask({
      taskId,
      date,
    })
  }
  // Função auxiliar para somar HH:mm:ss
  const calculateEndTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return "";

    const [h1, m1, s1] = startTime.split(':').map(Number);
    const [h2, m2, s2] = duration.split(':').map(Number);

    const totalSeconds = (h1 + h2) * 3600 + (m1 + m2) * 60 + (s1 + s2);
    
    // Garante que não ultrapasse 24h se desejar, ou apenas formata
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  // 🔥 verifica se todos hábitos estão completos
  const allDone = routine.habitSchedules?.every((schedule) => {
    const { habit } = schedule
    if (!habit) return false

    const limit = habit.limitCounter ?? 1
    const counter =
      habit.completions?.find(
        (c: any) =>
          c.completedDate.slice(0, 10) === selectedDate.slice(0, 10)
      )?.counter || 0

    return counter === limit
  })

  const totalHabits = routine.habitSchedules?.length || 1
  const totalTasks = routine.taskSchedules?.length || 1

  const doneHabitCount =
    routine.habitSchedules?.filter((hs: any) => {
      const habit = hs.habit
      if (!habit) return false

      const limit = habit.limitCounter ?? 1
      const counter =
        habit.completions?.find(
          (c: any) =>
            c.completedDate.slice(0, 10) === selectedDate.slice(0, 10)
        )?.counter || 0

      return counter === limit
    }).length || 0

  const doneTaskCount =
    routine.taskSchedules?.filter((hs: any) => {
      const task = hs.task
      if (!task) return false

      const limit = task.limitCounter ?? 1
      const counter =
        task.completions?.find(
          (c: any) =>
            c.completedDate.slice(0, 10) === selectedDate.slice(0, 10)
        )?.stepCounter || 0

      return counter === limit
    }).length || 0

  const progressTask = (doneTaskCount / totalTasks) * 100
  const progressHabit = (doneHabitCount / totalHabits) * 100
  
  const showHabits =
    !filter.values.length ||
    filter.field !== "type" ||
    filter.values.includes("habit")

  const showTasks =
    !filter.values.length ||
    filter.field !== "type" ||
    filter.values.includes("task")

  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl gap-4 transition-all duration-500 h-full overflow-hidden",

        // BASE
        "bg-card border border-white/5",

        // ATIVO (🔥 igual mock)
        allDone &&
          `
          border-green-500/40
          shadow-[0_0_40px_rgba(34,197,94,0.25)]
          bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_70%)]
          
          `
      )}
    >

      {/* HEADER */}
      <div className={
          cn(
            "flex items-start justify-between rounded-xl",   
            allDone && `bg-[url('/bg-card-active-routine.png')] bg-cover bg-no-repeat`
          )
        }
      >

        <div className="flex p-2 flex-row gap-3">
          <div className="my-auto p-2 rounded-lg bg-muted">
            {routine.emoji}
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">
              {routine.name}
            </h3>

            <p className="text-xs tracking-tighter truncate max-w-32 text-muted-foreground">
              {routine.description}
            </p>

            {/* UPDATED AT */}
            {/* {routine.updatedAt && (
              <span className="flex flex-row gap-1 items-center">
                <p className="text-sm tracking-tighter">
                  atualizado em{" "}
                </p>
                <p className="text-sm text-primary">
                  {
                    new Date(routine.updatedAt)
                      .toLocaleDateString("pt-BR")
                  }
                </p>
              </span>
            )} */}
          </div>
        </div>

        {/* MENU */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <UpdateRoutineDialog
              routine={routine}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="mr-2 w-4 h-4" />
                  Editar
                </DropdownMenuItem>
              }
            />

            <DropdownMenuSeparator />

            <DeleteRoutineDialog
              routineId={routine.id}
              trigger={
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Excluir
                </DropdownMenuItem>
              }
            />

          </DropdownMenuContent>
        </DropdownMenu>

      </div>
      
      {/* PROGRESS */}
      <div className="flex flex-row items-center gap-2 justify-between">
        <Progress
          value={progressTask + progressHabit}
          className="
            w-full
          bg-green-500/10 
            overflow-hidden
          [&>div]:bg-green-500
            [&>div]:shadow-[0_0_12px_rgba(34,197,94,0.9)]
            [&>div]:transition-all
            [&>div]:duration-500
            [&>div]:ease-out
          "
        />
        <p className="text-nowrap text-green-500 text-sm tracking-tighter">
          {progressHabit+progressTask} % Concluido
        </p>
      </div>

      {/* BADGES (tempo) */}
      {(routine.frequency || routine.cron) && (
        <div className="flex md:flex-row flex-col-reverse flex-wrap items-start justify-start gap-3">
            <RoutineFrequencyCard
              selectedDate={selectedDate}
              frequency={
                Array.isArray(routine?.frequency)
                  ? (routine.frequency as string[])
                  : undefined
              }
            />
          <RoutineCronCard cron={routine.cron} />
        </div>
      )}

      {/* SEARCH */}
      <div className="flex w-full flex-row justify-between gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border-white/10 focus-visible:ring-green-500"
          placeholder="Buscar hábito ou tarefa..."
        />
      
        <FilterDropdown
          filter={filter}
          setFilter={setFilter}
          categories={
            routine.habitSchedules?.flatMap((s: any) =>
              s.habit?.categories?.map((c: any) => c.name) || []
            ) || []
          }
        />
      </div>

      {/* HABITS */}
      {showHabits && (
        <div className="flex flex-col gap-3 max-h-50 overflow-y-auto scroll-container">
          <p className="text-xs font-semibold text-muted-foreground">
            Hábitos ({routine.habitSchedules?.length}) vinculados
          </p>
          {filteredHabits?.map((schedule) => {
            const habit = schedule.habit
            if (!habit) return null

            const limit = habit.limitCounter ?? 1

            const counter =
              habit.completions?.find(
                (c: any) =>
                  c.completedDate.slice(0, 10) ===
                  selectedDate.slice(0, 10)
              )?.counter || 0

            const progress = limit > 0 ? counter / limit : 0
            const isDone = counter === limit

          return (
            <Card
              key={habit.id}
              className={cn(
                "flex flex-col gap-0 justify-around p-4 rounded-2xl overflow-hidden transition-all duration-300 min-h-auto group",
                "bg-white/5 border-white/10 hover:border-white/20",
                // ESTADO ATIVO/CONCLUÍDO
                isDone && `
                  bg-transparent
                  border-green-500/40
                  shadow-[0_0_25px_rgba(34,197,94,0.15)]
                  bg-[url('/card-active-bg.png')]
                  bg-fill bg-center bg-no-repeat
                `
              )}
            >
              {/* HEADER: Emoji, Nome e Menu */}
              <div className="flex items-start justify-between w-full gap-2">

                <div className="flex flex-row items-center gap-2">
                  <div className="flex flex-row items-center gap-1">
                    <span className="text-xl mb-1 tracking-tighter">
                      {habit.emoji}
                    </span>
                    <p className="text-sm font-semibold truncate max-w-30 w-full tracking-tight text-zinc-100">
                      {habit.name}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={isPendingHabit}
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-white -mr-2"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DeleteHabitScheduleDialog
                        habitScheduleId={schedule.id}
                        routineId={schedule.routineId!}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400">
                            <Trash className="mr-2 h-4 w-4" />
                            Remover
                          </DropdownMenuItem>
                        }
                      />
                      <UpdateHabitSchedule
                        habit={habit}
                        schedule={schedule}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* CENTER: Botão de Progresso Circular */}
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="absolute inset-0 -rotate-90 w-12 h-12">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-white/5"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="rgb(34,197,94)"
                        strokeWidth="3"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={2 * Math.PI * 20 * (1 - progress)}
                        className="transition-all duration-700 ease-in-out"
                        style={{
                          filter: `drop-shadow(0 0 6px rgba(34,197,94,${progress > 0 ? 0.6 : 0}))`
                        }}
                      />
                    </svg>

                    <Button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={isPendingHabit}
                      className={cn(
                        "relative z-10 w-9 h-9 rounded-full transition-all duration-300",
                        "bg-zinc-800 border border-white/10 hover:scale-105 active:scale-95",
                        isDone && "bg-green-500 border-green-400 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      )}
                    >
                      {isDone ? (
                        <Check className="w-5 h-5 stroke-3" />
                      ) : (
                        <span className="text-xs font-bold">{counter}</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto pt-2">
                {/* FOOTER: Horário e Duração */}
                {schedule.clock && schedule.duration && (
                  <div className="flex items-center justify-between gap-2 bg-black/20 py-2 px-3 rounded-xl border border-white/5">
                    
                    {/* Início */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] font-medium text-blue-100/70">
                        {schedule.clock}
                      </span>
                    </div>

                    <Plus className="w-2.5 h-2.5 text-zinc-500" />

                    {/* Duração */}
                    <div className="flex items-center gap-1">
                      <AlarmCheck className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] font-medium text-purple-100/70">
                        {schedule.duration}
                      </span>
                    </div>

                    <ArrowRight className="w-2.5 h-2.5 text-zinc-500" />

                    {/* Término (Soma) */}
                    <div className="flex items-center gap-1 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] font-bold text-green-100/90">
                        {calculateEndTime(schedule.clock, schedule.duration)}
                      </span>
                    </div>
                    
                  </div>
                )}
              </div>
            </Card>
          );
          })}

          {filteredHabits.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-4">
              <p className="text-sm tracking-tighter mb-2">
                Nenhum hábito encontrado 👀
              </p>
              <UpdateRoutineDialog
                trigger={
                  <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
                    <p className="text-sm text-center tracking-tight">
                      Adicione hábitos a sua rotina e faça a magia acontecer 🪄
                    </p>
                  </Card>
                }
                routine={routine}
              />
            </div>
          )}
        </div>
      )}

      {/* TASKS */}
      {showTasks && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Tarefas ({routine.taskSchedules?.length}) vinculadas
          </p>

          <div className="flex flex-col gap-3 max-h-40 overflow-y-auto scroll-container">
          {filteredTasks?.map((schedule) => {
            const task = schedule.task
            if (!task) return null

            const selectedDateStr = selectedDate.slice(0, 10)
            
            // 🔥 pega completion do dia
            const completion = task.completions?.find(
              (c) => new Date(c.completedDate)?.
              toISOString()
              .slice(0, 10) === selectedDateStr
            )
            // 🔥 pega o CounterStep do dia
            const counterStep = completion?.counterStep?.find(
              (step) =>
                step.date.toISOString().slice(0, 10) === selectedDateStr
            )

            // 🔥 valores reais agora
            const current = counterStep?.currentStep ?? 0
            const limit = counterStep?.limit ?? task.limitCounter ?? 1

            const isCompleted = completion?.isCompleted ?? false

            // 🔥 lógica correta
            const isDone = isCompleted || current >= limit

            const progress = limit > 0 ? (current / limit) * 100 : 0

              return (
                <Card
                  key={task.id}
                  className={
                  cn(
                    "relative flex h-full flex-row items-center justify-between p-3 rounded-xl overflow-hidden transition-all duration-300",
                    // ATIVO
                    completion?.isCompleted &&
                      `
                        bg-transparent
                        rounded-sm
                        border-green-500/30
                        shadow-[0_0px_7px_rgba(34,197,94,0.25)]
                        bg-[url('/card-active-bg.png')]
                        bg-size-[110%]
                        bg-center
                        bg-no-repeat
                      `
                  )
                }
              >
                  {/* INFO */}
                  <div className="flex items-center gap-3">
                    {/* <Button type="button" disabled variant="ghost" size="icon-sm">
                      <Move />
                    </Button> */}
                    <span>{task.emoji}</span>
                    <p className="text-sm truncate tracking-tighter max-w-25">
                      {task.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">

                    {/* MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          disabled={isPendingTask}
                          size="icon-sm"
                          variant="ghost"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent>
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>

                        <UpdateTaskScheduleDialog
                          schedule={schedule} 
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Button
                                disabled={isPendingTask}  
                                type="button"
                                variant="ghost"
                              >
                                <Pencil className="w-3 h-3" />
                                <p className="text-sm tracking-tighter">
                                  Editar
                                </p>
                              </Button>
                            </DropdownMenuItem>
                          }
                        />
                        <DeleteTaskScheduleDialog
                          taskScheduleId={schedule.id}
                          routineId={routine.id}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Button
                                disabled={isPendingTask}
                                type="button"
                                variant="ghost"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                                <p className="text-destructive text-sm tracking-tighter">
                                  Remover
                                </p>
                              </Button>
                            </DropdownMenuItem>
                          }
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* TOGGLE */}
                    <div className="relative w-10 h-10 flex items-center justify-center">
    
                      {/* CÍRCULO DE PROGRESSO */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                          cx="50%"
                          cy="50%"
                          r="18"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="3"
                          fill="transparent"
                        />

                        <circle
                          cx="50%"
                          cy="50%"
                          r="18"
                          stroke="rgb(34,197,94)"
                          strokeWidth="3"
                          fill="transparent"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 18}
                          strokeDashoffset={
                            2 * Math.PI * 18 * (1 - progress)
                          }
                          className="transition-all duration-500"
                        />
                      </svg>

                      {/* BOTÃO */}
                      <Button
                        onClick={() => handleToggleTask(task.id, selectedDate)}
                        variant="ghost"
                        disabled={isPendingTask}
                        className={cn(
                          "relative z-10 rounded-full w-8 h-8 flex items-center justify-center",
                          
                          completion?.isCompleted && "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.8)]",
                          completion?.isCompleted && "animate-pulse",
                          !completion?.isCompleted && "bg-white/5"
                        )}
                      >
                        {completion?.isCompleted ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-[10px]">
                            {counterStep?.currentStep}
                          </span>
                        )}
                      </Button>

                    </div>
                  </div>
                </Card>
              )
            })}
            {filteredTasks.length === 0 && (
              <UpdateRoutineDialog
                trigger={
                  <Card className="flex flex-row justify-center gap-4 items-center px-4 cursor-pointer">
                    <p className="text-sm text-center tracking-tight">
                      Adicione tarefas a sua rotina e faça a magia acontecer 🪄
                    </p>
                  </Card>
                }
                routine={routine}
              />
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Button
        disabled={!allDone}
        className={cn(
          "w-full h-12 rounded-xl font-semibold transition-all",

          allDone
            ? "bg-linear-to-r from-green-500 to-emerald-400 text-white shadow-lg hover:opacity-90"
            : "bg-muted text-muted-foreground"
        )}
      >
        {allDone ? "✔ Concluído hoje" : "Marcar como concluído"}
      </Button>
    </Card>
  )
}

export default RoutineCard