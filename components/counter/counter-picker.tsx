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

import type { CreateTaskSchemaType, UpdateTaskSchemaType } from '@/lib/schema/task'

interface CounterPikcerProps {
  control: Control<CreateTaskSchemaType | UpdateTaskSchemaType>
}

const CounterPicker:React.FC<CounterPikcerProps> = ({
  control,
}) => {
  const [open, setOpen] = useState<boolean>(false)
  
  const {
    data: counters,
    isLoading,
    isFetching
  } = useQuery<{ data: (Counter & {
    metrics: TaskMetric[]
  })[] }>({
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
        <div className='flex flex-row items-center gap-2 w-full z-10'>
          <Button
            type='button'
            role='combobox'
            variant="outline"
            className='flex-1'
            disabled={isLoading || isFetching}
            aria-expanded
          >
          {isLoading ? (
            <span className='flex flex-row gap-2 items-center'>
              <Loader className='w-4 h-4 animate-spin' />
              <p className='text-sm'>
                Carregando contadores...
              </p>
            </span>
          ) : selectedCounter ? (
              <>
                <CounterRow counter={selectedCounter} />
              </>
            ) : (
              'Selecione o contador'
            )}
          </Button>

          {/* {selectedCounter && (
            <UpdateCounterDialog
              counter={selectedCounter}
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  // type='button'
                  // role='button'
                >
                  <PencilIcon className='w-3 h-3' />
                </Button>
              }
            />
          )} */}

        </div>
      </PopoverTrigger>

      <PopoverContent className=''>
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
          <CommandGroup className='overflow-y-auto'>
            <CommandList className=''>
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
                      className={cn(
                        "ml-auto h-4 w-4",
                        field.value === counter.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
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
    <div className="flex items-center justify-between gap-2 w-full">
      <div className='flex flex-row items-center'>
        <span role="img">{counter.emoji}</span>
        <span className='truncate sm:max-w-auto'>
          {counter.label}
        </span>
      </div>

      {/* <div>
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
      </div> */}
    </div>
  )
}

export default CounterPicker