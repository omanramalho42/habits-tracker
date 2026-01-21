"use client"

import { Popover } from '@radix-ui/react-popover'
import React, { useCallback, useState } from 'react'
import { PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import CreateGoalDialog from './create-goal-dialog'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { fetchGoals } from '@/services/goals'
import { Goals } from '@prisma/client'
import { Control, useController } from 'react-hook-form'
import { CreateHabitSchemaType } from '@/lib/schema/habit'

interface GoalPickerProps {
  control: Control<CreateHabitSchemaType>
  onSuccessCallback: (value: string) => void
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
  } = useQuery<Goals[]>({
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