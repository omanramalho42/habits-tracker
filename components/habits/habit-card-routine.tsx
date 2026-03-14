import { toast } from "sonner"

import confetti from "canvas-confetti"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"

import { Card } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import RemoveHabitRoutineDialog from "@/components/remove-habit-routine-dialog"
import UpdateRoutineHabitSchedule from "@/components/update-routine-habit-schedule-dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"


import {
  AlarmClock,
  Check,
  Clock,
  Clock10,
  MoreHorizontal,
  Pencil,
  Trash
} from "lucide-react"

import { cn, formatDateBR } from "@/lib/utils"

import type { Habit, HabitCompletion, HabitSchedule } from "@prisma/client"

interface HabitCardRoutineProps {
  schedule: HabitSchedule & { habit?: Habit & { completions?: HabitCompletion[]} }
  selectedDate?: Date
}

const HabitCardRoutine = ({
  schedule,
  selectedDate = new Date()
}: HabitCardRoutineProps) => {
  
  const sumTime = (clock?: string, duration?: string) => {
    if (!clock || !duration) return null

    const [h1, m1] = clock.split(":").map(Number)
    const [h2, m2] = duration.split(":").map(Number)

    const totalMinutes = (h1 * 60 + m1) + (h2 * 60 + m2)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  const queryClient = useQueryClient()
  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: {
      habitId: string
      date: string
    }) => {
      const response =
        await axios.post(`/api/habits/${habitId}/toggle`, {
          date,
        })
      return response.data
    },
    onSuccess: async (values) => {
      toast.success(
        "status do hábito alterado com sucesso.", {
          id: `toggle-habit`,
      })

      const selectedDateStr =
        formatDateBR(selectedDate)
      await queryClient.invalidateQueries({
        queryKey: ["routines", selectedDateStr],
      })
      await queryClient.invalidateQueries({
        queryKey: ["habits", selectedDateStr],
      })

      if(values.completed) {
        if(values.counter > 0 && values.counter !== schedule.habit?.limitCounter) {
          return
        }
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-habit",
      })
    },
  })
  
  const handleToggleHabit = (habitId: string, date: Date) => {
    toast.loading(
      "Alterando status do hábito de rotina...", {
        id: `toggle-habit`,
    })
    date.setHours(0,0,0,0)

    mutate({
      habitId,
      date: date.toISOString(),
    })
  }

  const completionToday =
    schedule?.habit?.completions?.find((c) =>
      c &&
      String(c.completedDate).slice(0, 10) ===
        selectedDate.toISOString().slice(0, 10)
    )
  const currentCounter = completionToday?.counter ?? 0  
  const limitCounter = schedule?.habit?.limitCounter ?? 1

  const completedProgress =
    limitCounter > 0
      ? Math.min((currentCounter / limitCounter) * 100, 100)
      : 0

  return (
    <Card
      key={schedule.id}
      className="p-4 hover:border-primary/40 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">

        {/* ICON */}
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
          <span className="text-lg">
            {schedule?.habit?.emoji}
          </span>
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1">

          {/* TIME INFO */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">

            {schedule.habit?.clock && (
              <div className="flex flex-row items-center gap-3">
                <div className="flex items-center gap-1">
                  <Clock10 className="w-3.5 h-3.5" />
                  <span>{schedule.habit.clock.slice(0,5)}</span>
                </div>

                <span className="opacity-40">+</span>
              </div>
            )}

            {schedule.habit?.duration && (
              <div className="flex flex-row items-center gap-3">
                <div className="flex items-center gap-1">
                  <AlarmClock className="w-3.5 h-3.5" />
                  <span>{schedule.habit.duration.slice(0,5)}</span>
                </div>

                <span className="opacity-40">→</span>
              </div>
            )}

            {schedule.habit?.clock && schedule.habit?.duration && sumTime(schedule.habit?.clock, schedule.habit?.duration) && (
              <div className="flex text-orange-400 items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{sumTime(schedule.habit?.clock, schedule.habit?.duration)}</span>
              </div>
            )}

          </div>

          {/* TITLE */}
          <div className="flex flex-row justify-between gap-2 items-center">
            <p
              className={`text-sm font-medium ${
                completionToday
                  ? "line-through text-muted-foreground opacity-60"
                  : "text-foreground"
              }`}
            >
              {schedule.habit?.name}
            </p>
            <div className="flex flex-row items-center gap-1">
              {schedule.habit?.limitCounter && schedule.habit?.limitCounter > 1 && (
                <Badge>
                  {currentCounter}x{schedule.habit?.limitCounter}
                </Badge>
              )}
              <Button
                variant={completionToday ? "default" : "outline"}
                size="icon-sm"
                disabled={isPending || !schedule.habit?.id}
                onClick={() => schedule.habit?.id && handleToggleHabit(schedule.habit.id, new Date(selectedDate))}
                className={cn(
                  "relative w-5 h-5 rounded-full flex items-center justify-center transition",
                  completionToday
                    ? `bg-primary text-white`
                    : "bg-background border border-border"
                )}
              >
                {completionToday && <Check className="w-5 h-5" />}
              </Button>

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
                    <RemoveHabitRoutineDialog
                      habitScheduleId={schedule.id}
                      routineId={schedule.routineId!}
                      trigger={
                        <DropdownMenuItem
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Button disabled={isPending} variant="ghost" type="button" size="icon">
                            <Trash className="h-3 w-3" />
                          </Button>
                          Remover
                        </DropdownMenuItem>
                      }
                    />
                    {schedule.habit && (
                      <UpdateRoutineHabitSchedule
                        habit={schedule.habit}
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
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>API</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
          </div>

          <Progress className="my-2" value={completedProgress} />
        </div>
        
      </div>
    </Card>
  )
}

export default HabitCardRoutine