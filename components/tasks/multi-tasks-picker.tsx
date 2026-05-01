"use client"

import React, { useCallback, useState } from 'react'
import { Control, useController } from 'react-hook-form'

import { useQuery } from '@tanstack/react-query'
import { fetchTasks } from '@/services/tasks'

import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty
} from '@/components/ui/command'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check } from "lucide-react"

import type { Task } from '@prisma/client'
import { CreateGroupTaskSchemaType, UpdateGroupTaskSchemaType } from '@/lib/schema/group-tasks'

interface MultiTasksPickerProps {
  control: Control<CreateGroupTaskSchemaType | UpdateGroupTaskSchemaType>
}

const MultiTasksPicker: React.FC<MultiTasksPickerProps> = ({ control }) => {
  const [open, setOpen] = useState<boolean>(false)

  const {
    data: tasks = [],
    isLoading,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  if (!control) return null

  const { field } = useController({
    control,
    name: 'tasks'
  })

  const selectedTasks = field?.value || []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={isLoading}
          className="flex flex-wrap w-full h-15 justify-between"
        >
          {selectedTasks.length > 0 ? (
            selectedTasks.map((taskId: string) => {
              const task = tasks.find(t => t.id === taskId)

              if (!task) return null

              return (
                <div key={task.id} className="flex items-center gap-2">
                  {task.name}
                </div>
              )
            })
          ) : (
            'Selecione as tarefas'
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Buscar tarefa..." />

          <Label className="px-4 py-2 text-sm font-semibold">
            Tasks ({selectedTasks.length})
          </Label>

          <CommandEmpty className="p-2">
            Nenhuma tarefa encontrada
          </CommandEmpty>

          <CommandGroup>
            <CommandList>
              {tasks.map((task) => (
                <CommandItem key={task.id}>
                  <TaskRow
                    control={control}
                    task={task}
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

function TaskRow({
  task,
  control
}: {
  task: Task,
  control: Control<CreateGroupTaskSchemaType>
}) {
  const { field } = useController({
    control,
    name: 'tasks'
  })

  const toggleTask = useCallback(() => {
    const current: string[] = field.value || []

    const exists = current.includes(task.id)

    if (exists) {
      field.onChange(current.filter(id => id !== task.id))
    } else {
      field.onChange([...current, task.id])
    }
  }, [field.value, task.id])

  const isSelected = field.value?.includes(task.id)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={toggleTask}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border cursor-pointer",
              isSelected ? "bg-primary/10 border-primary" : "border-border"
            )}
          >
            <span>{task.name}</span>

            <div className={cn(
              "w-5 h-5 rounded-full border flex items-center justify-center",
              isSelected && "bg-primary"
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent>
          {task.name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default MultiTasksPicker