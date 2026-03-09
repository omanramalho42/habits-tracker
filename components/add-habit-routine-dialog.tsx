"use client"

import React, { useState } from 'react'

import HabitPicker from '@/components/habit-picker'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardFooter
} from '@/components/ui/card'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form
} from '@/components/ui/form'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog'
import {
  TooltipTrigger, 
  TooltipContent,
  Tooltip
} from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import {
  AlarmClock,
  Clock8Icon,
  Trash,
  Edit,
  PlusSquare
} from 'lucide-react'
import { Label } from './ui/label'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { HabitWithStats } from '@/lib/types'

interface AddHabitRoutineDialogProps {
  onSuccessCallback: (values: HabitWithStats) => void
}

const AddHabitRoutineDialog = ({ onSuccessCallback }: AddHabitRoutineDialogProps) => {
  const [habits, setHabits] = useState<HabitWithStats[]>([])

  const addHabitRoutineSchema = z.object({
    duration: z.string(),
    clock:    z.string(),
    habits:    z.array(z.object({}))
  })
  
  type AddHabitRoutineSchemaType = z.infer<typeof addHabitRoutineSchema>
  
  const form = useForm<AddHabitRoutineSchemaType>({
    defaultValues: {
      clock: "",
      duration: "",
      habits: []
    }
  })

  const {
    control,
    reset,
    watch,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const [openModal, setOpenModal] = 
    useState<boolean>(false)

  const handleAddHabit = (habit: HabitWithStats) => {
    setHabits((prevHabits) => [...prevHabits, habit])
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button
          className='w-full my-4'
          type='button'
        >
          Vincular hábito ou atividade a rotina
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-180'>
        <DialogHeader>
          <DialogTitle>
            Vincular hábito ou atividade a rotina
          </DialogTitle>
          <DialogDescription>
            Vincular habitos e atividades
          </DialogDescription>
        </DialogHeader>

        {/* VINCULAR HABITOS */}
        <Card className='p-4'>

          <Form {...form}>
            <form className="flex flex-row justify-between gap-3">
              <FormField
                name="clock"
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      <Label
                        htmlFor="clock"
                        className="text-sm font-semibold"
                      >
                        Horário
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <div className='relative flex items-center'>
                        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                          <AlarmClock 
                            className="size-4 text-blue-400/70"
                          />
                        </div>
                        <Input
                          type='time'
                          id='time-picker'
                          step='1'
                          className='peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </div>
                    </FormControl>

                    <div className="absolute">
                      {fieldState.error && (
                        <span className="relative top-16 text-sm text-red-500">
                          {fieldState.error?.message}
                        </span>
                      )}
                    </div>

                  </FormItem>
                )}
              />
              <FormField
                name="duration"
                rules={{ required: true }}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      <Label
                        htmlFor="duration"
                        className="text-sm font-semibold"
                      >
                        Duração
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <div className='relative flex items-center'>
                        <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                          <Clock8Icon className="size-4 text-blue-400/70" />
                        </div>
                        <Input
                          type='time'
                          id='time-picker'
                          step='1'
                          className='peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </div>
                    </FormControl>

                    <div className='absolute'>
                      {fieldState.error && (
                        <span className="relative top-16 text-sm text-red-500">
                          {fieldState.error?.message}
                        </span>
                      )}
                    </div>

                  </FormItem>
                )}
              />    
            </form>
          </Form>
          
          <div className="flex flex-col gap-2 w-full">
            <Label
              htmlFor="habits"
              className={cn(errors.habits && errors.habits[habits.length] && 'text-red-500 font-semibold')}
            >
              Vincular hábito
            </Label>
            {/* <HabitPicker
              index={habits.length}
              control={control}
            /> */}
          </div>

          {/* HABITOS VINCULADOS  */}
          <div className='flex flex-col gap-3'>
            <Label>Hábitos vinculados: </Label>
            <Card className="px-4 py-4 max-h-40 overflow-auto">
              {habits.length !== 0 ? (
                <div className='flex flex-col gap-2'>
                  {habits.map((habit, index) => (
                    <div
                      key={index}
                      className='flex flex-row gap-4 justify-between items-center'
                    >
                      <div className='flex flex-row gap-2'>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='flex flex-row gap-2 items-center'>
                              <Clock8Icon className='w-4 h-4' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-sm'>
                              horário: {habit.clock}
                            </p>
                          </TooltipContent>
                        </Tooltip>


                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className='flex flex-row gap-2 items-center'>
                              <AlarmClock className='w-4 h-4' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-sm'>
                              duração: {habit.duration}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className='flex flex-row gap-2 items-center'>
                        <p className='w-full text-sm'>
                          {/* {habit.habitId.slice(0, 20).concat("...")} */}
                        </p>
                      </div>

                      <div className='flex flex-row gap-1'>
                        <Button
                          type='button'
                          variant="ghost"
                          // onClick={() => handleRemove(habit.habitId)}
                        >
                          <Trash
                            className='text-red-500 text-sm'
                          />
                        </Button>
                        <Button
                          type='button'
                          disabled
                          variant="ghost"
                        >
                          <Edit
                            className='text-info-500 text-sm'
                          />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-center'>
                  ainda não há hábitos vinculados.
                </p>
              )}
            </Card>
          </div>
            
          <CardFooter className='px-0'>
            <Button
              onClick={() => handleAddHabit}
              disabled={isSubmitting}
              type='button'
              className="
                w-full
                mt-2
                bg-blue-600
                hover:bg-blue-500
                text-white
                rounded-lg
                shadow-[0_0_25px_rgba(37,99,235,0.55)]
                transition-all
              "
            >
              <span>Adicionar</span>
              <PlusSquare className="ml-2 size-4" />
            </Button>
          </CardFooter>

        </Card>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={() => setOpenModal((prev) => !prev)}
            type='button'
          >
            Salvar
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default AddHabitRoutineDialog