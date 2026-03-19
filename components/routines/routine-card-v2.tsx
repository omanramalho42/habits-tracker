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
  AlarmClock,
  MoreHorizontal,
  Trash
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

interface RoutineCardProps {
  routine: Routine & {
    habitSchedules: HabitSchedule & {
      id: string,
      routineId: string,
      habit: Habit & {
        completions: HabitCompletion[]
      }
    }[]
  }
  selectedDate: string
}

const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  selectedDate
}) => {

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ habitId }: { habitId: string }) => {
      const res = await axios.put(`/api/habits/${habitId}`, {
        date: selectedDate
      })
      return res.data
    },
    onSuccess: async (values) => {
      await queryClient.invalidateQueries({ queryKey: ["routines"] })
      await queryClient.invalidateQueries({ queryKey: ["habits"] })

      if (values.counter === values?.completion?.habit?.limitCounter) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        })
      }

      toast.success("Hábito atualizado", { id: "toggle-habit" })
    },
    onError: () => {
      toast.error("Erro ao atualizar hábito", { id: "toggle-habit" })
    }
  })

  const handleToggleHabit = (habitId: string) => {
    toast.loading("Atualizando...", { id: "toggle-habit" })
    mutate({ habitId })
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

  const total = routine.habitSchedules?.length || 1
  const doneCount =
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

  const progress = (doneCount / total) * 100

  return (
    <Card
      className={cn(
        "relative flex flex-col p-5 rounded-2xl gap-4 transition-all duration-500 min-h-95 overflow-hidden",

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
      <div className="flex items-start justify-between">

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
              <span className="text-xs text-primary mt-1">
                atualizado em{" "}
                {new Date(routine.updatedAt)
                  .toLocaleDateString("pt-BR")}
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

      {/* BADGES (tempo) */}
      {/* {(routine.clock || routine.duration) && (
        <div className="flex gap-2">
          {routine.clock && (
            <Badge variant="secondary" className="gap-1">
              <AlarmClock className="w-3 h-3" />
              {routine.clock}
            </Badge>
          )}
          {routine.duration && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {routine.duration}
            </Badge>
          )}
        </div>
      )} */}

      {/* HABITS */}
      <div className="flex flex-col gap-3 max-h-48 overflow-y-auto scroll-container">
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
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="flex items-center gap-3">
                <span>{habit.emoji}</span>
                <p className="text-sm">{habit.name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isPending}
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
                            disabled={isPending}
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
                            disabled={isPending}
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
              <Button
                onClick={() => handleToggleHabit(habit.id)}
                variant="ghost"
                disabled={isPending}
                className={cn(
                  "relative overflow-hidden rounded-full border border-primary w-10 h-10",
                  isDone && "shadow-[0_0_12px_rgba(34,197,94,0.8)]",
                  isDone && "animate-pulse"
                )}
              >
                <span
                  className="absolute inset-0 bg-green-500 transition-all duration-500"
                  style={{
                    transform: `scaleX(${progress})`,
                    transformOrigin: "left",
                  }}
                />

                <span className="relative z-10">
                  {isDone ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span className="text-xs text-white">
                      {counter}/{limit}
                    </span>
                  )}
                </span>
              </Button>
            </div>
          )
        })}
      </div>

      {/* PROGRESS */}
      <Progress value={progress} />

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