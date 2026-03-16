"use client"

import { useState } from "react"
import { useController, Control } from "react-hook-form"

import { useQuery } from "@tanstack/react-query"

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty
} from "@/components/ui/command"

import { Button } from "@/components/ui/button"

import { fetchHabits } from "@/services/habits"
import { fetchTasks } from "@/services/tasks"

import { HabitWithStats } from "@/lib/types"

import { cn } from "@/lib/utils"

import { Check } from "lucide-react"
import { Task } from "@prisma/client"
import { UpdateRoutineSchemaType } from "@/lib/schema/routine"

interface MultiHabitsTasksPickerProps {
  control: Control<UpdateRoutineSchemaType>
}

export default function MultiHabitsTasksPicker({
  control
}: MultiHabitsTasksPickerProps) {

  const [open, setOpen] = useState(false)

  const { field: fieldTasks } = useController({
    control,
    name: "tasks"
  })
  const { field: fieldHabits } = useController({
    control,
    name: "habits"
  })

  const selectedHabits = fieldHabits?.value || []
  const selectedTasks = fieldTasks?.value || []

  const {
    data: habits = [],
    isLoading,
    isError,
    error
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: tasks = [],
    isLoading: isLoadingTask,
    isError: isErrorTask,
    error: errorTask
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  console.log({tasks}, {habits}, "✨")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>

        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedHabits.length > 0
            ? `${selectedHabits.length + selectedTasks.length}  selecionados`
            : "Selecione hábitos ou tasks"}
        </Button>

      </PopoverTrigger>

      <PopoverContent className="w-87.5 p-0">
        <Command>
          <CommandInput placeholder="Pesquisar..." />

          <CommandEmpty>
            Nenhum item encontrado
          </CommandEmpty>

          <CommandList>

            {/* HABITS */}
            <CommandGroup heading="Hábitos">
              {habits.map((habit) => (
                <CommandItem key={habit.id}>
                  <HabitRow
                    habit={habit}
                    control={control}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            {/* TASKS */}
            <CommandGroup heading="Tasks">
              {tasks.map((task) => (
                <CommandItem key={task.id}>
                  <TaskRow
                    task={task}
                    control={control}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

          </CommandList>

        </Command>

      </PopoverContent>
    </Popover>
  )
}

const TaskRow = ({
  task,
  control
}: any) => {
  const { field } = useController({
    control,
    name: "tasks"
  })

  console.log(field.value, 'field value tasks');
  // return
  const isSelected =
    field.value?.some((i: any) => i && i.id === task?.id) || false

  const toggle = () => {

    const exists =
      field.value?.find((i: any) => i.id === task.id)

    if (!exists) {
      field.onChange([...field.value, task])
    } else {
      field.onChange(
        field.value.filter((i: any) => i.id !== task.id)
      )
    }
  }

  return (
    <div
      onClick={toggle}
      className="flex items-center gap-2 w-full cursor-pointer"
    >

      <span>📝</span>

      <span className="flex-1">
        {task.name}
      </span>

      <Check
        className={cn(
          "h-4 w-4",
          isSelected
            ? "opacity-100"
            : "opacity-0"
        )}
      />

    </div>
  )
}

const HabitRow = ({
  habit,
  control
}: any) => {
  const { field } = useController({
    control,
    name: "habits"
  })

  console.log(field.value, 'field value habits');
  const isSelected =
    field.value?.some((i: any) => i.id === habit.id)

  const toggle = () => {

    const exists =
      field.value?.find((i: any) => i.id === habit.id)

    if (!exists) {
      field.onChange([...field.value, habit])
    } else {
      field.onChange(
        field.value.filter((i: any) => i.id !== habit.id)
      )
    }
  }

  return (
    <div
      onClick={toggle}
      className="flex items-center gap-2 w-full cursor-pointer"
    >

      <span>{habit.emoji}</span>

      <span className="flex-1">
        {habit.name}
      </span>

      <Check
        className={cn(
          "h-4 w-4",
          isSelected
            ? "opacity-100"
            : "opacity-0"
        )}
      />

    </div>
  )
}