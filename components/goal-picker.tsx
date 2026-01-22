"use client"

import React, { useCallback, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import { fetchGoals, GoalsDTO } from '@/services/goals'

import CreateGoalDialog from '@/components/create-goal-dialog'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
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

import type { CreateHabitSchemaType, UpdateHabitSchemaType } from '@/lib/schema/habit'

interface GoalPickerProps {
  control: Control<CreateHabitSchemaType | UpdateHabitSchemaType>
  onSuccessCallback?: (value: string) => void
}

const GoalPicker:React.FC<GoalPickerProps> = ({ onSuccessCallback, control }) => {
  const [open, setOpen] = useState<boolean>(false)

  const { field } = useController({
    control: control,
    name: 'goal'
  })

  // REALIZAR UMA QUERY PARA OBJETIVOS
  const {
    data: goals = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<GoalsDTO[]>({
    queryKey: ["goals"],
    queryFn: () => fetchGoals(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const selectedGoal =
    goals.find(
      (goal: any) => 
        goal.id === field.value || ""
    )
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role='combobox'
          aria-expanded={open}
          className="w-full justify-between"
          variant="outline"
        >
        {selectedGoal ? (
            <GoalRow goal={selectedGoal} />
          ) : (
            'Selecione a categoria'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-50 p-0'>
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <CommandInput
            disabled={isLoading || isFetching}
            placeholder="Pesquise o objetivo..."
          />
          <CreateGoalDialog
            // onSuccessCallback={() => {}}
          />
          <CommandEmpty className='p-2'>
            <p className='text-sm'>
              Objetivo não encontrado
            </p>
            <p className="text-xs text-muted-foreground">
              Criar novo objetivo
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {goals && (
                goals.map((goal) => (
                  <CommandItem
                    key={goal.id}
                    onSelect={() => {
                      field.onChange(goal.id)
                      setOpen((prev) => !prev)
                    }}
                  >
                    <GoalRow goal={goal} />
                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  </CommandItem>
                ))
              )}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function GoalRow({ goal }: { goal: any }) {
  return (
    <div className="flex items-center gap-2">
      <span role="img">{goal.emoji}</span>
      <span>{goal.name}</span>
    </div>
  )
}


export default GoalPicker