"use client"

import React, { useState } from 'react'

import { useForm } from 'react-hook-form'

import z from 'zod'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from './ui/form'

import { Button } from './ui/button'

import { AlarmClock, Clock8Icon, PlusCircle, PlusSquare } from 'lucide-react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card } from './ui/card'
import { cn } from '@/lib/utils'
import HabitPicker from './habit-picker'
import CalendarBookingPickerDemo from './calendar-booking-picker-demo'
import CalendarHabitsPicker from './calendar-habits-picker'

import { motion, AnimatePresence } from "framer-motion"

interface CreateRoutineDialogProps {
  trigger: React.ReactNode
}

const routineSchema = z.object({
  name: z.string(),
  clock: z.string(),
  duration: z.string(),
  habit: z.string(), 
})

export type CreateRoutineSchemaType = z.infer<typeof routineSchema>

const CreateRoutineDialog:React.FC<CreateRoutineDialogProps> = ({ trigger }) => {
  const [step, setStep] = useState(1)
  const [isFlying, setIsFlying] = useState(false)

  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  const handleAdd = () => {
    if (!addButtonRef.current) return

    setIsFlying(true)

    // simula duração da animação
    setTimeout(() => {
      setIsFlying(false)
      setStep(2)
    }, 700)
  }

  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<CreateRoutineSchemaType>({
    defaultValues: {
      name: "",
      clock: "",
      duration: ""
    }
  })

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: {
      errors,
      isLoading,
      isSubmitting
    }
  } = form

  const onSubmit = (values: CreateRoutineSchemaType) => {
    console.log(values, "values");
    setStep(1)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar novo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn("max-w-180 bg-[#070B14]/80 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.35)] text-white")}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Criar rotina
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100/60">
            Rotinas servem para gerenciar melhor o seu dia
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence>
          {isFlying && (
            <motion.div
              initial={{
                opacity: 1,
                scale: 1,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: 0,
                scale: 0.3,
                x: 260,   // ajuste fino visual
                y: -180
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="
                pointer-events-none
                absolute
                bottom-24
                right-10
                bg-blue-500
                rounded-full
                w-10 h-10
                shadow-[0_0_30px_rgba(37,99,235,0.8)]
              "
            />
          )}
        </AnimatePresence>
        
        <Form {...form}>
          <form className='space-y-3'>

            <FormField
              name='name'
              control={control}
              rules={{ required: true, min: 5 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold"
                    >
                      Nome da rotina
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="
                        bg-black/50
                        border border-white/10
                        focus:border-blue-500/60
                        focus:ring-1 focus:ring-blue-500/30
                        rounded-lg
                        text-white
                        placeholder:text-white/30
                      "
                      {...field}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='ex: teste'
                    />
                  </FormControl>
                  {errors && errors.name && (
                    <span className='text-sm text-red-500'>
                      {errors.name.message}
                    </span>
                  )}
                </FormItem>
              )}
            />
            {step === 1 && (
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
                        {errors.clock && (<span className="text-sm text-red-500">{errors.clock?.message}</span>)}
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
                        {errors.clock && (<span className="text-sm text-red-500">{errors.clock?.message}</span>)}
                      </FormItem>
                    )}
                  />  
                </div>

                <Button
                  ref={addButtonRef}
                  onClick={handleAdd}
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

              </Card>
            )}

            {step === 2 && (
              <>
                <CalendarHabitsPicker />
              </>
            )}

          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="
                border-white/15
                bg-black/30
                hover:bg-black/50
                text-white
              "
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={step !== 2 || isSubmitting}
            className="
              bg-blue-600
              hover:bg-blue-500
              shadow-[0_0_20px_rgba(37,99,235,0.45)]
            "
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}

export default CreateRoutineDialog