"use client"

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import { fetchHabits } from '@/services/habits'

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
import { UpdateRoutineHabitScheduleSchemaType } from './update-routine-habit-schedule-dialog'

interface HabitPickerProps {
  control: Control<UpdateRoutineHabitScheduleSchemaType>
}

const HabitPicker:React.FC<HabitPickerProps> = ({ control }) => {
  const [open, setOpen] = useState<boolean>(false)
  const { field, formState: { errors } } = useController({
    control: control,
    name: "habit"
  })

  const {
    data: habits = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery({
    queryKey: ['habits', 'routines'],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
    retry: 1
  })

  const selectedHabit =
    habits.find((habit) => habit.id === field.value?.id)

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
            {selectedHabit ? (
              <span className="flex items-center gap-2">
                {selectedHabit.emoji}
                {selectedHabit.name}
              </span>
            ) : (
              "Selecione o hábito"
            )}
          </Button>
          <div className="absolute">
            {errors.habit && (
              <p className='relative top-16 text-red-500 text-sm'>
                {typeof errors.habit.message === 'string' ? errors.habit.message : ''}
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
              {habits.map((habit) => (
                <CommandItem
                  key={habit.id}
                  onSelect={() => {
                    field.onChange(habit)
                    setOpen(false)
                  }}
                >
                  <HabitRow habit={habit} />

                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value?.id === habit.id
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

function HabitRow({ habit }: { habit: any }) {
  return (
    <div className="flex items-center gap-3 sm:w-full w-30">
      <span role="img">{habit.emoji}</span>
      <span className='truncate sm:max-w-auto'>{habit.name}</span>
    </div>
  )
}

export default HabitPicker