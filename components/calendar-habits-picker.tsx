'use client'

import { useState } from 'react'

import { formatDateRange } from 'little-date'
import { AlarmClock, Clock8Icon, PlusIcon, PlusSquare } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { CreateRoutineSchemaType } from './create-routine-dialog'
import { Control, useController } from 'react-hook-form'
import { Label } from './ui/label'
import HabitPicker from './habit-picker'
import { FormControl, FormField, FormItem, FormLabel } from './ui/form'
import { Input } from './ui/input'
import React from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'

const events = [
  {
    title: 'Team Sync Meeting',
    from: '2025-06-12T09:00:00',
    to: '2025-06-12T10:00:00'
  },
  {
    title: 'Design Review',
    from: '2025-06-12T11:30:00',
    to: '2025-06-12T12:30:00'
  },
  {
    title: 'Client Presentation',
    from: '2025-06-12T14:00:00',
    to: '2025-06-12T15:00:00'
  }
]

interface CalendarHabitsPickerProps {
  control: Control<CreateRoutineSchemaType>
  onSuccessCallback: (values: CreateRoutineSchemaType) => void
}

const CalendarHabitsPicker = ({
  control,
  onSuccessCallback
}: CalendarHabitsPickerProps) => {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [show, setShow] = useState<boolean>(false);

  // const [isFlying, setIsFlying] = useState(false)
  // const addButtonRef = React.useRef<HTMLButtonElement>(null)
  // const handleAdd = () => {
  //   if (!addButtonRef.current) return

  //   setIsFlying(true)

  //   // simula duração da animação
  //   setTimeout(() => {
  //     setIsFlying(false)
  //     // setStep(2)
  //   }, 700)
  // }
  
  const {
    field: fieldClock, 
    formState: {
      errors: errorsClock,
      isSubmitting: isSubmittingClock
    }
  } = useController({
    control: control,
    name: "clock",
  })

  const {
    field: fieldDuration, 
    formState: {
      errors: errorsDuration,
      isSubmitting: isSubmittingDuration
    }
  } = useController({
    control: control,
    name: "duration",
  })


  return (
    <div>
      <Card className='w-full sm:flex-row'>
        {/* <CardContent className='px-4'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            className='w-full bg-transparent p-0'
            required
          />
        </CardContent> */}
        <CardFooter className='flex flex-col items-start gap-3 px-4'>
          <div className='flex w-full items-center justify-between px-1'>
            <div className='text-sm font-medium'>
              {date?.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
            <Dialog
              open={show}
              onOpenChange={setShow}
            >
              <DialogTrigger asChild>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='size-6'
                  title='Add Event'
                  onClick={() => {
                    setShow(true)
                  }}
                >
                  <PlusIcon />
                  <span className='sr-only'>
                    Add Event
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw]">
                <DialogHeader>
                  <DialogTitle>Criar rotina</DialogTitle>
                  <DialogDescription>
                    Detalhes da rotina
                  </DialogDescription>
                </DialogHeader>

                <Card
                  className="
                    p-4
                    bg-black/40
                    border border-white/10
                    rounded-xl
                    shadow-inner
                  "
                >
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="goal" className="text-sm font-medium">
                      Vincular hábito
                    </Label>
                    <HabitPicker
                      control={control}
                    />
                  </div>

                  <div className="flex flex-row justify-between sm:gap-3">
                    <FormField
                      name="clock"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>
                            <Label
                              htmlFor="clock"
                              className="text-sm font-semibold"
                            >
                              Horario
                            </Label>
                          </FormLabel>
                          <FormControl>
                            <div className='relative'>
                              <div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50'>
                                <AlarmClock className="size-4 text-blue-400/70" />
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
                          {errorsClock && (
                            <span
                              className="text-sm text-red-500"
                            >{errorsClock.clock?.message}</span>)}
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="duration"
                      rules={{ required: true }}
                      render={({ field }) => (
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
                            <div className='relative'>
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
                          {errorsClock.clock && (
                            <span className="text-sm text-red-500">
                              {errorsClock.clock?.message}
                            </span>
                          )}
                        </FormItem>
                      )}
                    />  
                  </div>

                  {/* <Button
                    ref={addButtonRef}
                    onClick={handleAdd}
                    disabled={isSubmittingClock || isSubmittingDuration}
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
                  </Button> */}

                </Card>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      type='button'
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type='button'
                    onClick={() => onSuccessCallback}
                  >
                      Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
          <div className='flex w-full flex-col gap-2'>
            {events.map(event => (
              <div
                key={event.title}
                className='bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full'
              >
                <div className='font-medium'>{event.title}</div>
                <div className='text-muted-foreground text-xs'>
                  {formatDateRange(new Date(event.from), new Date(event.to))}
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default CalendarHabitsPicker
