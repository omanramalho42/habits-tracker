"use client"

import React, { useState } from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { updateTaskSchedule } from '@/services/task-schedule'

import TaskPicker from '@/components/tasks/task-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
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
import { Label } from '@/components/ui/label'

import type { 
  Categories,
  Goals,
  Task,
  TaskCompletion,
  TaskSchedule
} from '@prisma/client'

import { cn } from '@/lib/utils'

import type { UpdateTaskScheduleSchemaType } from '@/lib/schema/task-schedule'

import {
  AlarmClock,
  Clock8Icon,
} from 'lucide-react'

interface UpdateTaskScheduleProps {
  trigger?: React.ReactNode;
  schedule: TaskSchedule & { task?: Task & { completions?: TaskCompletion[], goals?: Goals[], categories?: Categories[] } }
}

const UpdateTaskScheduleDialog = ({
  trigger,
  schedule
}: UpdateTaskScheduleProps) => {
  const form = useForm<UpdateTaskScheduleSchemaType>({
    defaultValues: {
      id: schedule.id,
      clock: schedule?.clock || "",
      duration: schedule?.duration || "",
      task: schedule.task || null
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
    mutationFn: updateTaskSchedule,
    onMutate: () => {
      return toast.loading(
        "Atualizando tarefa da rotina...",
        { id: "update-task-schedule" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
        exact: false,
      })

      toast.success(
        "Tarefa da rotina atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar tarefa da rotina",
        { id: toastId }
      )
    },
  })

  const onSubmit: SubmitHandler<UpdateTaskScheduleSchemaType> =
    async (values: UpdateTaskScheduleSchemaType) => {
      console.log(values, "values")

      mutate({
        id: values.id,
        clock: values.clock,
        duration: values.duration,
        task: values.task
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
            Vincular tarefa a rotina
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='max-w-180'>
        <DialogHeader>
          <DialogTitle>
            Vincular tarefa a rotina
          </DialogTitle>
          <DialogDescription>
            Vincular tarefa
          </DialogDescription>
        </DialogHeader>

        {/* VINCULAR tarefas */}
        <Card className='p-4'>

          <Form {...form}>
            <form className="flex flex-col gap-3">
              <div className='flex flex-row gap-3 justify-between'>
                <FormField
                  control={control}
                  name="clock"
                  rules={{ required: false }}
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
                  control={control}
                  name="duration"
                  rules={{ required: false }}
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
                  htmlFor="tasks"
                  className={cn(errors.task && 'text-red-500 font-semibold')}
                >
                  Vincular tarefa
                </Label>
                <TaskPicker
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

export default UpdateTaskScheduleDialog