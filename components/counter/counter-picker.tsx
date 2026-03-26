"use client"

import React, { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Control, useController } from 'react-hook-form'

import axios from 'axios'

import CreateCounterDialog from '@/components/counter/create-counter-dialog'

import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'

import { cn } from '@/lib/utils'

import { Check, Loader } from 'lucide-react'

import type { Counter, TaskMetric } from '@prisma/client'

import type { CreateTaskSchemaType } from '@/lib/schema/task'


interface CounterPikcerProps {
  control: Control<CreateTaskSchemaType>
}

const CounterPicker:React.FC<CounterPikcerProps> = ({
  control
}) => {
  const [open, setOpen] = useState<boolean>(false)
  
  const {
    data: counters,
    isLoading,
    isFetching
  } = useQuery<{ data: (Counter & { metrics: TaskMetric[] })[] }>({
    queryKey: ["counter"],
    queryFn: async () => {
      return await axios.get("/api/counter")
    },
    staleTime: 1000 * 60,
    retry: 1,
  })

  const { field } = useController({
    control: control,
    name: "counterId"
  })

  const selectedCounter: any =
    counters?.data.find(
      (counter: any) => 
        counter.id === field.value || ""
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          role='combobox'
          variant="outline"
          className='w-full'
          disabled={isLoading || isFetching}
          aria-expanded
        >
        {isLoading ? (
          <span className='flex flex-row gap-2 items-center'>
            <Loader className='w-4 h-4 animate-spin' />
            <p className='text-sm'>Carregando contadores...</p>
          </span>
        ) : selectedCounter ? (
            <CounterRow counter={selectedCounter} />
          ) : (
            'Selecione o contador'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }} 
        >
          <CommandInput
            disabled={isLoading || isFetching}
            placeholder="Pesquise o contador..."
          />
          <CreateCounterDialog />
          <CommandEmpty className='p-2'>
            <p className='text-sm'>
              Contador não encontrado
            </p>
            <p className="text-xs text-muted-foreground">
              Criar novo contador
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {counters?.data?.map((counter) => {
                return (
                  <CommandItem
                    key={counter.id}
                    onSelect={() => {
                      field.onChange(counter.id)
                      setOpen((prev) => !prev)
                    }}
                  >
                    <CounterRow counter={counter} />
                    <Check
                      className={
                        cn("mr-2 h-4 w-4 opacity-0")
                      }
                    />
                  </CommandItem>
                )
              })}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const CounterRow:React.FC<{ counter: (Counter & { metrics: TaskMetric[]}) }> = ({ counter }) => {
  return (
    <div className="flex items-center gap-2 w-full">
      <span role="img">{counter.emoji}</span>
      <span className='truncate sm:max-w-auto'>{counter.label}</span>
      <div>
        {counter?.metrics?.map((metric) => {
          return (
            <div className='flex flex-row gap-2 items-center'>
              <span role="img">
                {metric?.emoji}
              </span>
              <span className='truncate sm:max-w-auto'>
                {metric?.field}
              </span>
              <span className='truncate sm:max-w-auto'>
                {metric?.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CounterPicker