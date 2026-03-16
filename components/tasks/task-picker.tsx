"use client"

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import { fetchTasks } from '@/services'

import { CreateHabitDialog } from '@/components/create-habit-dialog'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { Check } from 'lucide-react'

import type { Task } from '@prisma/client'
import type { UpdateTaskScheduleSchemaType } from '@/lib/schema/task-schedule'

interface TaskPickerProps {
  control: Control<UpdateTaskScheduleSchemaType>
}

const TaskPicker:React.FC<TaskPickerProps> = ({ control }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { field, formState: { errors } } = useController({
    control: control,
    name: "task"
  })

  const {
    data: tasks = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ['tasks', 'routines'],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60,
    retry: 1
  })

  const selectedTask =
    tasks.find((task) => task.id === field.value?.id)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='flex flex-col justify-start items-start gap-1'>
          <Button
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            variant="outline"
            type='button'
          >
            {selectedTask ? (
              <span className="flex items-center gap-2">
                {selectedTask.emoji}
                {selectedTask.name}
              </span>
            ) : (
              "Selecione a tarefa"
            )}
          </Button>
          <div className="absolute">
            {errors.task && (
              <p className='relative top-16 text-red-500 text-sm'>
                {typeof errors.task.message === 'string' ? errors.task.message : ''}
              </p>
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className='w-50 p-0'>
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <CommandInput
            disabled={isLoading || isFetching}
            placeholder="Pesquise a tarefa..."
          />
          <CreateHabitDialog />
          <CommandEmpty className='p-2'>
            <p className='text-sm'>
              Tarefa não encontrado
            </p>
            <p className="text-xs text-muted-foreground">
              Criar nova tarefa
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  onSelect={() => {
                    field.onChange(task)
                    setOpen(false)
                  }}
                >
                  <TaskRow task={task} />

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value?.id === task.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div className="flex items-center gap-3 sm:w-full w-30">
      <span role="img">{task.emoji}</span>
      <span className='truncate sm:max-w-auto'>{task.name}</span>
    </div>
  )
}

export default TaskPicker