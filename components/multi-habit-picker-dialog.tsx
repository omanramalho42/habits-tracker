"use client"

import React, { useCallback, useEffect, useState } from 'react'

import { Control, useController } from 'react-hook-form'

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
import { CreateRoutineSchemaType } from '@/lib/schema/routine'
import { CreateHabitDialog } from './create-habit-dialog'
import { useQuery } from '@tanstack/react-query'
import { Habit, HabitWithStats } from '@/lib/types'
import { fetchHabits } from '@/services/habits'

interface MultiHabitsPickerProps {
  control: Control<CreateRoutineSchemaType>
}

const MultiHabitsPicker:React.FC<MultiHabitsPickerProps> = ({ control }) => {
  const [open, setOpen] =
    useState<boolean>(true)

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

  if(!control) {
    return null
  }

  const { field } = useController({
    control: control,
    name: 'habits'
  })
  const habitsListLoaded: any =
    field?.value?.map(item => item) || []
  console.log(habitsListLoaded, "habuts list loaded")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          disabled={isLoading}
          className="flex flex-wrap flex-row overflow-y-auto scroll-container w-full h-24 justify-between hover:text-foreground"
        >
          {habitsListLoaded.length > 0 ? (
            habitsListLoaded.map((habit: HabitWithStats, index: number) => {
              return (
                <div
                  key={index}
                  className={`flex w-full items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md`}
                >
                  <p>
                    {habit?.emoji}
                  </p>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{habit?.name}</h4>
                      {/* <Badge variant="outline" className="text-xs bg-gray-900">
                        {habit.category?.name}
                      </Badge> */}
                    </div>
                    {/* <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p> */}
                  </div>
                </div>
              )
            })
          ) : (
            'Selecione o hábito'
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 scroll-container">
        <Command
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <CommandInput placeholder="Pesquise pelo hábito..." />
          <CreateHabitDialog />
          <div
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center justify-between cursor-pointer select-none"
          >
            <Label className="text-sm font-semibold px-4 py-2">
              Hábitos{" "}
              <span className="text-muted-foreground font-normal">
                ({habitsListLoaded.length} selecionados)
              </span>
            </Label>
          </div>
          <CommandEmpty className='p-2'>
            <p className='text-sm'>Hábito não encontrada</p>
            <p className="text-xs text-muted-foreground">
              Criar um novo hábito
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList className=''>
              {habits &&
                habits.map((habit: HabitWithStats) => {
                  return (
                    <CommandItem
                      key={habit.id}
                    >
                      <HabitRow
                        control={control}
                        habit={habit}
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

function HabitRow({
  habit,
  control
}: {
  habit: HabitWithStats,
  control: Control<CreateRoutineSchemaType>
}) {
  const [open, setOpen] = useState<boolean>(false)

  if(!control) {
    return null
  }

  const { field } = useController<any>({
    control: control,
    name: 'habits'
  })

  const toggleHabit = useCallback((habit: HabitWithStats) => {
    // SE O ARRAY FOR VAZIO ENTAO ADICIONE O HABITO A LISTA
    if (field?.value?.length === 0) {
      //DEFINIR OS IDS DOS HABITOS
      const newHabitId: any[] = [habit]

      field.onChange(newHabitId)
      // setHabitList([habit])
    } else {
      //CASO JA EXISTA ALGUM VALOR DENTRO DA LISTA
      //VERIFICA SE EXERCICIO EXISTE NA LISTA
      const existOnList = field?.value?.find((item: any) => (
        item.id === habit.id
      ))
      //CASO EXERCICIO NAO EXISTA NA LISTA
      if (!existOnList ) {
        //CRIE UM NOVO ARRAY COM OS HABITOS QUE JÁ EXISTIAM NA LISTA E ADICONE O NOVO EXERCICIO
        const newListHabits: HabitWithStats[] = [
          ...(field?.value || []),
          habit
        ]
        //SETE O NOVO exercicio
        // setHabitList(newListHabits);
        //DEFINIR OS IDS DO EXERCICIOS
        const habitsId: HabitWithStats[] = 
          newListHabits.map(
            (habit) => habit
          )

        field.onChange(habitsId)
      } else {
        ///CASO O EXERCICIO JÁ TENHA SIDO ADICIONADO
        //CRIE UMA NOVA LISTA COM TODOS OS HABITOS MENOS O QUE FOI REMOVIDA AGORA
        const newHabitsList: HabitWithStats[] =
          field?.value?.filter((item: Habit) => (
            item.id !== habit.id
          ))
        //DEFINIR OS IDS DOS HABITOS
        const habitsId: any[] = 
          newHabitsList.map(
            (habit) => habit
          )
        //SETE A NOVA LSITA DE  HABITOS, AGORA REMOVENDO O EXERCICIO DESVINCULADO
        // setHabitList(newHabitsList)
        field.onChange(habitsId)
      }
    }
  }, [field.value])

  const isSelected =
    field.value?.some(
      (item: any) => item.id === habit.id
    )

  return (
    <TooltipProvider key={habit.id}>
      <Tooltip
        open={open}
        defaultOpen={false}
        onOpenChange={setOpen}
      >
        <TooltipTrigger asChild>
          <div
            onClick={(e) => {
              toggleHabit(habit)
            }}
            className={`flex w-full items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              isSelected
                ? "bg-primary/10 border-primary"
                : "bg-card border-border text-foreground hover:border-primary/40"
            }`}
          >
            {/* <Image
              width={64}
              height={64}
              src={exercise.image || "/placeholder.svg"}
              alt={exercise.name}
              className="w-16 h-16 rounded-md object-cover"
            /> */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-row items-start gap-2 mb-1">
                <p className='text-sm'>{habit.emoji}</p>
                <h4 className="font-semibold text-sm">{habit.name}</h4>
                {/* <Badge variant="outline" className="text-xs bg-gray-900">
                  {habit.emoji}
                </Badge> */}
              </div>
              {/* <p className="text-xs text-muted-foreground line-clamp-1">{habit.description}</p> */}
            </div>
            <div className="shrink-0">
              <div
                className={cn(
                  'w-6 h-6 rounded-full ',
                  isSelected && 'bg-primary flex items-center justify-center',
                  !isSelected && 'border-2 border-muted-foreground/30'
                )}
              > 
                {isSelected && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </div>
          </div>
        </TooltipTrigger>

        <TooltipContent side="left" className="max-w-xs bg-transparent overflow-hidden">
          <div className="relative">
            {/* <Image
              width={256}
              height={192}
              src={routine.image || "/placeholder.svg"}
              alt={routine.name}
              className="w-64 h-48 object-cover"
            /> */}
            <div className="p-3 bg-background/95 backdrop-blur">
              <h4 className="font-bold mb-1 text-foreground">
                {habit.name}
              </h4>
              {/* <p className="text-xs text-muted-foreground">
                {habit.description}
              </p> */}
              {/* <Badge variant="secondary" className="mt-2 text-xs">
                {routine?.category?.name}
              </Badge> */}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


export default MultiHabitsPicker