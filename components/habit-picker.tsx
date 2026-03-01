"use client"

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import { fetchHabits } from '@/services/habits'

import { CreateRoutineSchemaType } from '@/components/create-routine-dialog'
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
import { CreateHabitDialog } from './create-habit-dialog'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HabitPickerProps {
  control: Control<CreateRoutineSchemaType>
}

const HabitPicker:React.FC<HabitPickerProps> = ({ control }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { field, formState: { errors } } = useController({
    control: control,
    name: 'habit'
  })

  const {
    data: habits = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ['habits'],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
    retry: 1
  })

  const selectedHabit =
    habits.find(
      (goal: any) => 
        goal.id === field.value || ""
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='flex flex-col justify-start items-start gap-1'>
          <Button
            role='combobox'
            aria-expanded={open}
            className={cn("w-full justify-between")}
            variant="outline"
          >
          {selectedHabit ? (
              <HabitRow habit={selectedHabit} />
            ) : (
              <p>
                Selecione o hábito
              </p>
            )}
          </Button>
          {errors.habit && <p className='text-red-500 text-sm'>{errors.habit.message}</p>}
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
            placeholder="Pesquise o hábito..."
          />
          <CreateHabitDialog />
          <CommandEmpty className='p-2'>
            <p className='text-sm'>
              Hábito não encontrado
            </p>
            <p className="text-xs text-muted-foreground">
              Criar novo Hábito
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {habits && (
                habits.map((habit) => (
                  <CommandItem
                    key={habit.id}
                    onSelect={() => {
                      field.onChange(habit.id)
                      setOpen((prev) => !prev)
                    }}
                  >
                    <HabitRow habit={habit} />
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

function HabitRow({ habit }: { habit: any }) {
  return (
    <div className="flex items-center gap-3 sm:w-full w-30">
      <span role="img">{habit.emoji}</span>
      <span className='truncate sm:max-w-auto'>{habit.name}</span>
    </div>
  )
}

export default HabitPicker