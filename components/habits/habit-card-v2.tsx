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
  File
} from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'
import { UpdateHabitSchemaType } from '@/lib/schema/habit'
import { updateHabit } from '@/services/habits'

interface HabitCardProps {
  habit: HabitWithStats
  selectedDate: string
  onToggle?: (habitId: string) => void
  loading?: boolean
}

const days = ['D','S','T','Q','Q','S','S']

const HabitCardNew: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
  onToggle,
  loading
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
    const newDate= new Date()
    newDate.setHours(23,59,59,999)
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

  return (
    <Card className='flex flex-col w-full p-4 gap-4 group'>

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
              <Button variant="ghost" size="icon">
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

              {isCompletedToday && (
                <CreateAnnotationDialog
                  completionId={habit?.lastCompletionId || ""}
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
        {days.map((day, index) => {
          const isActive = habit.frequency?.includes(index)

          return (
            <Fragment key={index}>
              <div className='flex flex-col items-center gap-1'>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs
                  ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {day}
                </div>

                <span className={`w-1.5 h-1.5 rounded-full
                  ${isActive ? 'bg-primary' : 'bg-muted'}
                `}/>
              </div>
            </Fragment>
          )
        })}
      </div>

      {/* PROGRESS */}
      <div className='flex items-center gap-3'>
        <Progress value={completedProgress} className='h-2' />
        <span className='text-xs text-muted-foreground'>
          {completedDays}/{habit.limitCounter ?? 0}
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
          variant={isCompletedToday ? 'default' : 'outline'}
          className='rounded-full'
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