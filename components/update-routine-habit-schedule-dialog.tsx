"use client"

import React, { useState } from 'react'

import HabitPicker from '@/components/habit-picker'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardFooter
} from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form
} from '@/components/ui/form'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog'
import {
  TooltipTrigger, 
  TooltipContent,
  Tooltip
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import {
  AlarmClock,
  Clock8Icon,
  Trash,
  Edit,
  PlusSquare,
  BotOff,
  PowerOff
} from 'lucide-react'
import { Label } from './ui/label'
import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { HabitWithStats } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { updateRoutineHabitSchedule } from '@/services/routines'
import { Habit, HabitSchedule } from '@prisma/client'
import axios from 'axios'

interface UpdateRoutineHabitScheduleProps {
  trigger?: React.ReactNode;
  habit: Habit;
  schedule: HabitSchedule;
}

const updateRoutineHabitScheduleSchema = z.object({
  id: z.string(),
  duration: z.string(),
  clock:    z.string(),
  habit:    z.any({})
})

export type UpdateRoutineHabitScheduleSchemaType = z.infer<typeof updateRoutineHabitScheduleSchema>

const UpdateRoutineHabitSchedule = ({
  trigger,
  schedule,
  habit,
}: UpdateRoutineHabitScheduleProps) => {
  
  const form = useForm<UpdateRoutineHabitScheduleSchemaType>({
    defaultValues: {
      id: schedule.id,
      clock: schedule?.clock || "",
      duration: schedule?.duration || "",
      habit: habit || null
    }
  })

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const [open, setOpen] = 
    useState<boolean>(false)
  
  const queryClient = useQueryClient()
  
  const { mutate } = useMutation({
    mutationFn: updateRoutineHabitSchedule,
    onMutate: () => {
      return toast.loading(
        "Atualizando hábito da rotina...",
        { id: "update-routine" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
        exact: false,
      })

      toast.success(
        "Hábito da rotina atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar hábito da rotina",
        { id: toastId }
      )
    },
  })

  const onSubmit: SubmitHandler<UpdateRoutineHabitScheduleSchemaType> = async (data: UpdateRoutineHabitScheduleSchemaType) => {
    console.log(data, "data!")

    mutate({
      id: data.id,
      clock: data.clock,
      duration: data.duration,
      habit: data.habit
    })

    setOpen(prev => !prev)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className='w-full my-4'
            type='button'
          >
            Vincular hábito ou atividade a rotina
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-180'>
        <DialogHeader>
          <DialogTitle>
            Vincular hábito ou atividade a rotina
          </DialogTitle>
          <DialogDescription>
            Vincular habitos e atividades
          </DialogDescription>
        </DialogHeader>

        {/* VINCULAR HABITOS */}
        <Card className='p-4'>

          <Form {...form}>
            <form className="flex flex-col gap-3">
              <div className='flex flex-row gap-3 justify-between'>
                <FormField
                  name="clock"
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <Label
                          htmlFor="clock"
                          className="text-sm font-semibold"
                        >
                          Horário
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <div className='relative flex items-center'>
                          <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                            <AlarmClock 
                              className="size-4 text-blue-400/70"
                            />
                          </div>
                          <Input
                            type='time'
                            id='time-picker'
                            step='1'
                            className='peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </div>
                      </FormControl>

                      <div className="absolute">
                        {fieldState.error && (
                          <span className="relative top-16 text-sm text-red-500">
                            {fieldState.error?.message}
                          </span>
                        )}
                      </div>

                    </FormItem>
                  )}
                />
                <FormField
                  name="duration"
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <Label
                          htmlFor="duration"
                          className="text-sm font-semibold"
                        >
                          Duração
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <div className='relative flex items-center'>
                          <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                            <Clock8Icon className="size-4 text-blue-400/70" />
                          </div>
                          <Input
                            type='time'
                            id='time-picker'
                            step='1'
                            className='peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </div>
                      </FormControl>

                      <div className='absolute'>
                        {fieldState.error && (
                          <span className="relative top-16 text-sm text-red-500">
                            {fieldState.error?.message}
                          </span>
                        )}
                      </div>

                    </FormItem>
                  )}
                />    
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Label
                  htmlFor="habits"
                  className={cn(errors.habit && 'text-red-500 font-semibold')}
                >
                  Vincular hábito
                </Label>
                <HabitPicker
                  control={control}
                />
              </div>

            </form>
          </Form>
        </Card>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            type='button'
          >
            Salvar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default UpdateRoutineHabitSchedule