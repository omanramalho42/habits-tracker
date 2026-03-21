"use client"

import React from "react"
import axios from "axios"
import confetti from "canvas-confetti"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

import {
  Check,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  MoreHorizontal,
  Trash,
  CalendarDays,
  Filter,
  Move3D,
  Move
} from "lucide-react"

import UpdateRoutineDialog from "@/components/update-routine-dialog"
import DeleteRoutineDialog from "@/components/delete-routine-dialog"

import UpdateHabitSchedule  from "@/components/update-habit-schedule-dialog"
import DeleteHabitScheduleDialog from "@/components/delete-habit-schedule-dialog"

import type {
  HabitCompletion,
  HabitSchedule,
  Routine,
  Task,
  TaskCompletion,
  Habit,
  TaskSchedule
} from "@prisma/client"

import UpdateTaskScheduleDialog from "../task-schedule/update-task-schedule-dialog"
import DeleteTaskScheduleDialog from "../task-schedule/delete-task-schedule-dialog"

import { Input } from "../ui/input"
import { WEEKDAYS } from "@/lib/habit-utils"
import { FloatingActionBar } from "./float-action-bar"
import { BottomNavigation } from "./bottom-navigation"

interface RoutineCardProps {
  routine: (Routine & {
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
    })
  selectedDate: string
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  selectedDate
}) => {

  const queryClient = useQueryClient()

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

      if(values.completed) {
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

  const progressTask = (doneTaskCount / totalTasks) * 100
  const progressHabit = (doneHabitCount / totalHabits) * 100
  
  console.log({ routine }, "routine")
  return (
    <Card
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-2xl gap-4 transition-all duration-500 h-full overflow-hidden",

        // BASE
        "bg-zinc-900/60 border border-white/5",

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
            "flex items-start justify-between",          
          )
        }
      >

        <div className="flex gap-3">
          <div className="p-2 rounded-xl bg-muted">
            {routine.emoji}
          </div>

          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">
              {routine.name}
            </h3>

            <p className="text-xs text-muted-foreground">
              {routine.description}
            </p>

            {/* UPDATED AT */}
            {routine.updatedAt && (
              <span className="flex flex-row gap-2 items-center text-xs mt-1">
                atualizado em{" "}
                <p className="text-primary ">
                  {
                    new Date(routine.updatedAt)
                      .toLocaleDateString("pt-BR")
                  }
                </p>
              </span>
            )}
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
          className="w-full"
          color="green"
          value={progressTask + progressHabit}
        />
        <p className="text-nowrap text-green-500 text-sm tracking-tighter">
          {progressHabit+progressTask} % Concluido
        </p>
      </div>

      {/* BADGES (tempo) */}
      {(routine.frequency || routine.cron) && (
        <div className="flex gap-2">
          {routine.frequency && (
            <Badge variant="secondary" className="gap-1">
              <CalendarDays className="w-3 h-3" />
              {/* {WEEKDAYS.map((day) => {
                return (
                  <p className="text-sm">

                  </p>
                )
              })} */}
              {routine.frequency.toString()}
            </Badge>
          )}
          {routine.cron && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {routine.cron}
            </Badge>
          )}
        </div>
      )}

      {/* SEARCH */}
      <div className="flex w-full flex-row justify-between gap-2">
        <Input
          disabled
          className="w-full"
          type="text"
          placeholder="Pesquise pelo nome..."
          // value={filter}
          // onChange={(event) =>
          //   handleFilterHabits(event.target.value)
          // }
        />
      
        <Button
          disabled
          variant="outline"
          type="button"
          size="icon-lg"
        >
          <Filter />
        </Button>
      </div>

      {/* HABITS */}
      <div className="flex flex-col gap-3 max-h-22 overflow-y-auto scroll-container">
        <p className="text-xs font-semibold text-muted-foreground">
          Hábitos ({routine.habitSchedules?.length}) vinculados
        </p>
        {routine.habitSchedules?.map((schedule) => {
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
              className={
                cn(
                  "flex h-full flex-row items-center justify-between px-3 rounded-xl overflow-hidden transition-all duration-300",
                  // ATIVO
                  isDone &&
                    `
                    bg-transparent
                    rounded-sm
                    border-green-500/30
                    shadow-[0_0_20px_rgba(34,197,94,0.25)]
                    bg-[url('/card-active-bg.png')]
                    bg-size-[110%]
                    bg-center
                    bg-no-repeat
                    `
                )
              }
            >
              <div className="flex items-center gap-3">
                <span>{habit.emoji}</span>
                <p className="text-sm truncate tracking-tighter max-w-15">
                  {habit.name}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isPendingHabit}
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
                    <DeleteHabitScheduleDialog
                      habitScheduleId={schedule.id}
                      routineId={schedule.routineId!}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Button
                            disabled={isPendingHabit}
                            variant="ghost"
                            type="button"
                            size="icon"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                          Remover
                        </DropdownMenuItem>
                      }
                    />
                    <UpdateHabitSchedule
                      habit={habit}
                      schedule={schedule}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Button
                            disabled={isPendingHabit}
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
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* BOTÃO PROGRESSIVO */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                {/* PROGRESSO CIRCULAR */}
                <svg className="absolute inset-0 rounded-full w-full h-full -rotate-90">
                  {/* fundo */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="18"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="3"
                    fill="transparent"
                  />

                  {/* progresso */}
                  <circle
                    cx="50%"
                    cy="50%"
                    r="18"
                    stroke="rgb(34,197,94)"
                    strokeWidth="3"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - progress)}
                    className="transition-all duration-500"
                    style={{
                      filter: `drop-shadow(0 0 6px rgba(34,197,94,${progress}))`
                    }}
                  />

                </svg>

                {/* BOTÃO */}
                <Button
                  onClick={() => handleToggleHabit(habit.id)}
                  variant="ghost"
                  disabled={isPendingHabit}
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",

                    // base
                    "bg-white/5 border border-white/10",

                    // progresso parcial
                    schedule?.habit?.limitCounter !== 1 &&
                      counter >= 1 &&
                      !isDone &&
                      "border-green-500/60",

                    // completo
                    isDone &&
                      `
                      bg-green-500 
                      text-white 
                      border-green-500
                      shadow-[0_0_12px_rgba(34,197,94,0.8)]
                      scale-110
                      `
                  )}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-[10px] text-white">
                      {counter}
                    </span>
                  )}
                </Button>

              </div>
            </Card>
          )
        })}
        {routine.habitSchedules?.length === 0 && (
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
        )}
      </div>

      {/* TASKS */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Tarefas ({routine.taskSchedules?.length}) vinculadas
        </p>

        <div className="flex flex-col gap-3 max-h-40 overflow-y-auto scroll-container">
          {routine.taskSchedules?.map((schedule) => {
            const task = schedule.task
            if (!task) return null
            const counter =
              task.completions?.find(
                (c: any) =>
                  c.completedDate.slice(0, 10) ===
                  selectedDate.slice(0, 10)
              )?.counter || 0
            const limit = task.limitCounter ?? 1

            const progress = limit > 0 ? counter / limit : 0
            const isDone = counter === limit
            return (
              <Card
                key={task.id}
                className={
                cn(
                  "relative flex h-full flex-row items-center justify-between p-3 rounded-xl overflow-hidden transition-all duration-300",
                  // ATIVO
                  isDone &&
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
                        
                        isDone && "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.8)]",
                        isDone && "animate-pulse",
                        !isDone && "bg-white/5"
                      )}
                    >
                      {isDone ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px]">
                          {counter}
                        </span>
                      )}
                    </Button>

                  </div>
                </div>
              </Card>
            )
          })}
          {routine.taskSchedules?.length === 0 && (
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
{/*       
      <FloatingActionBar /> */}
    </Card>
  )
}

export default RoutineCard