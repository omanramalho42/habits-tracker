"use client"

import React, { Fragment, useCallback } from 'react'

import axios from 'axios'
import confetti from 'canvas-confetti'

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

import DeleteHabitDialog from "@/components/delete-habit-dialog"
import { UpdateHabitDialog } from "@/components/update-habit-dialog"
import { HabitDetailDialog } from "@/components/habit-detail-dialog"
import CreateAnnotationDialog from "@/components/annotations/create-annotation-dialog"

import {
  AlarmClock,
  ArrowUpDownIcon,
  Check,
  Clock10,
  MoreVertical,
  Pencil,
  Trash2,
  EyeIcon,
  File,
  CheckCheckIcon,
  X,
  CheckCircle2Icon
} from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'
import { UpdateHabitSchemaType } from '@/lib/schema/habit'
import { updateHabit } from '@/services/habits'
import { WEEKDAYS } from '@/lib/habit-utils'
import { cn } from '@/lib/utils'

interface HabitCardProps {
  habit: HabitWithStats
  selectedDate: string
  onToggle?: (habitId: string) => void
  loading?: boolean
}

const HabitCardNew: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
}) => {

  const queryClient = useQueryClient()
  const { mutate, data, isPending } = useMutation({
    mutationFn: async ({
      habitId,
      date
    }: {
      habitId: string
      date: string
    }) => {
      const response =
        await axios.put(`/api/habits/${habitId}`, {
          date,
        })
      return response.data
    },
    onSuccess: async (values) => {
      await queryClient.invalidateQueries({
        queryKey: ["habits"],
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
        "Sucesso ao alterar o status do hábito...",
        { id: 'toggle-task' }
      )
    },
    onError: (error: any) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-task",
      })
    },
  })

  const handleUpdateHabit = useCallback((data: UpdateHabitSchemaType) => {
    updateHabitMutation.mutate(data)
  }, [])

  const updateHabitMutation = useMutation({
    mutationFn: updateHabit,
    onMutate: () => {
      return toast.loading(
        "Atualizando hábito...",
        { id: "update-habit" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["habits"],
        exact: false,
      })
      queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
      toast.success(
        "Hábito atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar hábito",
        { id: toastId }
      )
    },
  })

  const handleToggleHabit = (habitId: string, date: string) => {
    toast.loading(
      "Alterando status do hábito...", {
        id: `toggle-task`,
    })
    const newDate = new Date(date)
    // HACK
    newDate.setHours(
      newDate.getHours()+3
    )
    mutate({
      habitId,
      date: newDate.toISOString(),
    })
  }
  // Define a data atual com base na data selecionada
  // Se não existir, usa a data de hoje
  const currentDate:Date =
    new Date(selectedDate) || new Date()
  const todayStr =
    currentDate.toISOString().split("T")[0]

  const limit = habit.limitCounter ?? 1
  const isMulti = limit > 1
  const counter = 
    habit?.completions?.find(
      (c) => 
        new Date(c.completedDate).toISOString().split("T")[0] === 
       currentDate.toISOString().split("T")[0]
    )?.counter || 0
  const completedProgress =
    limit > 0
      ? Math.min(counter / limit) * 100
      : 0
  // TOGGLE
  const isCompletedToday = habit.completions?.some((c) => {
    const completionDate = new Date(c.completedDate).toISOString().split("T")[0]
    const limit = habit.limitCounter || 1
    const counter = c.counter || 0

    return completionDate === todayStr && counter === limit
  })
  const completedDays = habit.completions?.length || 0
  const totalDays = habit.endDate?.length ?? 365

  const todayCompletion =
    habit.completions?.find(
      c =>
        new Date(c.completedDate).toISOString().split("T")[0] ===
        selectedDate
    ) ?? null

  const completedDaysSet = new Set(
    habit.completions?.map((c) => new Date(c.completedDate).getDay())
  )

  return (
    <Card
      className={cn(
        'relative flex flex-col w-full p-4 gap-4 rounded-2xl transition-all duration-300',

        // BASE (default)
        'bg-zinc-900/60 border border-white/5',

        // ATIVO (completado)
        isCompletedToday &&
          `
          border-green-500/40
          shadow-[0_0_25px_rgba(34,197,94,0.25)]
          bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_70%)]
          `,
          
        // HOVER (efeito premium)
        'hover:shadow-lg hover:scale-[1.01]'
      )}
    >

      {/* HEADER */}
      <div className='flex items-start justify-between gap-3'>

        <div className='flex gap-3 min-w-0'>

          {/* EMOJI */}
          <div className='p-2 rounded-xl bg-muted shrink-0'>
            <p className='text-xl'>{habit.emoji}</p>
          </div>

          {/* TITLE */}
          <div className='flex flex-col min-w-0'>
            <h4 className='text-sm font-semibold truncate'>
              {habit.name}
            </h4>

            <div className='flex flex-wrap gap-2 text-xs text-muted-foreground'>
              {habit.categories?.[0] && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1'>
                      <span>{habit.categories[0].emoji}</span>
                      <span className='truncate'>
                        {habit.categories[0].name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Categoria: {habit.categories[0].name}
                  </TooltipContent>
                </Tooltip>
              )}

              {habit.goals?.[0] && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className='flex items-center gap-1'>
                      <span>{habit.goals[0].emoji}</span>
                      <span className='truncate'>
                        {habit.goals[0].name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Objetivo: {habit.goals[0].name}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className='flex items-center gap-2'>

          {(habit.clock || habit.duration) && (
            <div className='flex gap-1'>
              {habit.clock && (
                <Badge variant="secondary" className='gap-1'>
                  <AlarmClock className='w-3 h-3' />
                  {habit.clock}
                </Badge>
              )}
              {habit.duration && (
                <Badge variant="secondary" className='gap-1'>
                  <Clock10 className='w-3 h-3' />
                  {habit.duration}
                </Badge>
              )}
            </div>
          )}

          {/* DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                disabled={isPending}
                variant="ghost"
                size="icon"
              >
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <UpdateHabitDialog
                habit={habit}
                onSuccessCallback={handleUpdateHabit}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                }
              />

              <DropdownMenuSeparator />

              <DeleteHabitDialog
                habitId={habit.id}
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                }
              />

              <HabitDetailDialog
                habit={habit}
                selectedDate={selectedDate}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Detalhes
                  </DropdownMenuItem>
                }
              />

              {todayCompletion && (
                <CreateAnnotationDialog
                  completionId={todayCompletion?.id}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <File className="mr-2 h-4 w-4" />
                      Anotação
                    </DropdownMenuItem>
                  }
                />
              )}

            </DropdownMenuContent>
          </DropdownMenu>

          <ArrowUpDownIcon className='w-4 h-4 opacity-50 cursor-grab' />
        </div>
      </div>

      {/* FREQUENCY */}
      <div className="flex justify-between">
        {WEEKDAYS.map((day, index) => {
          const newDate = new Date(selectedDate)
          newDate.setHours(newDate.getHours() + 3)

          const todayIndex = newDate.getDay()
          const isToday = index === todayIndex

          const completed = completedDaysSet.has(index)
          const isActive = habit.frequency?.includes(day.key)

          return (
            <Fragment key={index}>
              <div className='flex flex-col items-center gap-1'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={
                        cn(
                          `cursor-pointer transition-colors delay-100 w-7 h-7 flex items-center justify-center rounded-full text-xs`,
                          isActive 
                            ? 'bg-red-800 shadow-sm shadow-red-900 text-white'
                            : 'bg-muted text-muted-foreground',
                          completed && 'bg-green-600 shadow-green-600',
                          isToday && 'bg-transparent outline-1 outline-primary font-bold shadow-sm shadow-green-600',
                          isToday && completed && 'bg-transparent outline-1 outline-green-500 font-bold shadow-sm shadow-green-600',
                          isToday && !completed && 'bg-transparent outline-1 outline-red-500 font-bold shadow-sm shadow-green-600',
                        )
                      }
                    >
                      {day.keyPtBr}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-foreground p-2" color='white'>
                    {completed ? (
                      isMulti ? (<CheckCheckIcon className='size-4' />) : (<Check className='size-4'/>)
                    ) : (
                      (<X className='size-4'/>)
                    )}
                  </TooltipContent>
                </Tooltip>

                <span
                  className={
                    cn(
                      "w-1.5 h-1.5 rounded-full",
                      isActive 
                        ? 'bg-red-800 shadow-sm shadow-red-500 text-white' 
                        : 'bg-muted text-muted-foreground',
                      completed && 'bg-green-600 shadow-green-400',
                      // isToday && 'bg-none outline-1 outline-primary',
                    )
                  }
                />
              </div>
            </Fragment>
          )
        })}
      </div>

      {/* PROGRESS */}
      <div className='flex items-center gap-3'>
        <Progress value={completedProgress/totalDays} className='h-2' />
        <span className='text-xs text-muted-foreground'>
          {completedDays}/{habit.completions.length * totalDays}
        </span>
      </div>

      <Separator />

      {/* FOOTER */}
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground text-center'>
          🔥 {habit.current_streak ?? 0} de {totalDays} completados
        </div>

        <Button
          onClick={() => handleToggleHabit(habit.id, selectedDate)}
          variant={isCompletedToday ? 'default' : 'ghost'}
          className={cn(
            'rounded-full border border-primary',
            isCompletedToday && 'border-green-500'
          )}
          size="icon"
        >
          {isCompletedToday && (
            <Check className='w-4 h-4' />
          )}
        </Button>
      </div>
    </Card>
  )
}

export default HabitCardNew