"use client"

import React, { Fragment, useState } from 'react'

import Link from 'next/link'

import { Controller, useForm } from 'react-hook-form'

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import z from 'zod'

import HabitPicker from '@/components/habit-picker'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'

import { Button } from '@/components/ui/button'

import {
  AlarmClock,
  CalendarIcon,
  CircleOff,
  Clock8Icon,
  PlusSquare,
  Trash
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardFooter } from '@/components/ui/card'

import { motion, AnimatePresence } from "framer-motion"

import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { format } from "date-fns"
import { Calendar } from './ui/calendar'
import MultipleSelector from './ui/multi-select'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select'

interface CreateRoutineDialogProps {
  trigger: React.ReactNode
}

const routineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  startDate: z.coerce.date(),
  clock: z.string(),
  duration: z.string(),
  cron: z.string(),
  frequency: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      key: z.string()
    })
  ),
  habit: z.string(),
})

export type CreateRoutineSchemaType = z.infer<typeof routineSchema>

const CreateRoutineDialog:React.FC<CreateRoutineDialogProps> = ({ trigger }) => {
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [step, setStep] = useState(1)
  const [isFlying, setIsFlying] = useState<boolean>(false)

  const addButtonRef = React.useRef<HTMLButtonElement>(null)

  const frequency = [
    { label: 'domingo', key: 'D', value: 'dom' },
    { label: 'segunda', key: 'S', value: 'seg' },
    { label: 'terça', key: 'T', value: 'ter' },
    { label: 'quarta', key: 'Q', value: 'qua' },
    { label: 'quinta', key: 'Q', value: 'qui' },
    { label: 'sexta', key: 'S', value: 'sex' },
    { label: 'sabado', key: 'S', value: 'sav' },
  ]
  const crons = [
    {value:"semanalmente", label:"semanalmente"},
    {value:"mensalmente", label: "mensalmente"},
    {value: "diariamente", label: "diariamente"},
  ]

  const [habits, setHabits] = useState<{
    clock: string;
    duration: string;
    habitId: string;
  }[]>([]);

  const handleAdd = async () => {
    await triggerRHF()
    if(!watch("habit")) {
      setError('habit', {
        type: 'manual',
        message: 'Por favor selecione um hábito válido'
      })
      return
    }
    
    if (!addButtonRef.current) return

    setIsFlying(true)

    if(
      watch('clock') !== "" && 
      watch('duration') !== "" && 
      watch('habit') !== ""
    ) {
      const newHabit = {
        clock: watch('clock'),
        duration: watch('duration'),
        habitId: watch('habit')
      }
      if(habits.length > 0) {
        setHabits([...habits, newHabit])
      } else {
        setHabits([newHabit])
      }
    }
    // simula duração da animação
    setTimeout(() => {
      setIsFlying(false)
      // setStep(2)
    }, 700)

    setValue('clock', ""),
    setValue('duration', ""),
    setValue('habit', "")
  }

  const handleRemove = (habitId: string) => {
    const newHabitsArray: {
      clock: string;
      duration: string;
      habitId: string
    }[] = habits.filter(
      habit => 
        habit.habitId
          .trim()
          .toLowerCase() !==
        habitId
          .trim()
          .toLowerCase()
    )
    setHabits(newHabitsArray)
  }

  const [open, setOpen] = useState<boolean>(false)
  const today = new Date()
  today.setHours(0,0,0,0)

  const form = useForm<CreateRoutineSchemaType>({
    defaultValues: {
      name: "",
      cron: "",
      description: "",
      frequency: [],
      startDate: today, 
      clock: "",
      duration: ""
    }
  })

  const {
    handleSubmit,
    reset,
    control,
    watch,
    trigger: triggerRHF,
    setValue,
    setError,
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
          <form className='space-y-1'>
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
            <FormField
              name='description'
              control={control}
              rules={{ required: true, min: 5 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Descrição da rotina
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
                      placeholder='ex: coloque uma breve descrição da rotina'
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
            <FormField
              control={control}
              name="emoji"
              render={({ field }) => (
                <FormItem className="grid-cols-1 gap-3">
                  <FormLabel htmlFor="icon">
                    Icone
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Card
                          className="w-full h-full"
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-3xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Toque para trocar
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <CircleOff className="h-6 w-6 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground text-center">
                                Toque para selecionar
                              </p>
                            </div>
                          )}
                        </Card>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom"
                        align="center"
                        className="
                          bg-transparent
                          border-none
                          w-[90vw] max-w-sm
                          sm:w-105
                          p-0
                          max-h-[80vh]
                          overflow-hidden
                        "
                      >
                        <div className="">
                          <Picker
                            data={data}
                            theme="dark"
                            disabled={isSubmitting}
                            navPosition="bottom"
                            previewPosition="top"
                            searchPosition="sticky"
                            skinTonePosition="preview"
                            onEmojiSelect={(emoji: { native: string }) => {
                              field.onChange(emoji.native)
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* DATAS */}
            <div className="flex justify-between gap-2">
              {/* DATA INICIAL E FINAL */}
              <div className='w-full'>
                <Label className="text-sm font-semibold mb-1.5 block">
                  Data inicial
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !watch('startDate') && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch('startDate') 
                        ? format(watch('startDate'), "PPP") 
                        : <span>Escolha a data</span>
                      }
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <FormField
                      name="startDate"
                      rules={{ required: true }}
                      render={({ field }) => (
                        <FormItem>
                          {/* <FormLabel></FormLabel> */}
                          <FormControl>
                            <Calendar
                              {...field}
                              mode="range"
                              // selected={new Date(field.value.from)}
                              // onSelect={field.onChange}
                            />
                          </FormControl>
                          {errors.startDate && (<span className="text-sm text-red-500">{errors.startDate?.message}</span>)}
                        </FormItem>
                      )}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* FREQUENCIA */}
            <div className='flex flex-col gap-2 items-start justify-start'>
              <Label>Cronograma</Label>
              <Controller
                control={control}
                name='cron'
                render={({ field }) => {
                  return (
                    <div className='w-full space-y-2'>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Selecione o cronograma' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Cronograma</SelectLabel>
                            {crons.map((item) => {
                              return (
                                <SelectItem value={item.value}>
                                  {item.label}
                                </SelectItem>
                              )
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                }}
              />
            </div>

            <div className='flex flex-col gap-2 items-start'>
              <Label>Frequencia</Label>
              <Controller
                control={control}
                name='frequency'
                render={({ field }) => {
                  return (
                    <MultipleSelector
                      commandProps={{
                        label: 'Selecione a frequencia'
                      }}
                      onChange={(value) => {
                        field.onChange(value)
                      }}
                      value={field.value}
                      defaultOptions={frequency}
                      placeholder='Selecione a frequencia'
                      hideClearAllButton
                      hidePlaceholderWhenSelected
                      emptyIndicator={<p className='text-center text-sm'>Nenhum resultado encontrado</p>}
                      className='w-full'
                    />
                  )
                }}
              />
            </div>
            {/* ADICIONAR HABITOS A ROTINA */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button
                  style={{ zIndex: -1 }}
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
                    Vincular habitos e ativiades
                  </DialogDescription>
                </DialogHeader>

                {/* VINCULAR HABITOS */}
                <Card className='p-4'>
                  <div className="flex flex-row justify-between gap-3">
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
                  
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="goal" className={cn(errors.habit && 'text-red-500 font-semibold')}>
                      Vincular hábito
                    </Label>
                    <HabitPicker
                      control={control}
                    />
                  </div>
                  {/* HABITOS VINCULADOS  */}
                  <div className='flex flex-col gap-3'>
                    <Label>Hábitos vinculados: </Label>
                    <Card className="px-4 py-4 max-h-40 overflow-auto">
                      {habits.length !== 0 ? (
                        <div className='flex flex-col gap-2'>
                          {habits.map((habit) => (
                            <div key={habit.habitId} className='flex flex-row gap-4 justify-between items-center'>
                              <div className='flex min-w-22 flex-row gap-2 items-center'>
                                <Clock8Icon className='w-4 h-4' />
                                <p className='text-sm'>
                                  {habit.clock}
                                </p>
                              </div>

                              <div className='flex flex-row gap-2 items-center'>
                                <AlarmClock className='w-4 h-4' />
                                <p className='text-sm'>
                                  {habit.duration}
                                </p>
                              </div>

                              {/* <p className='w-full text-sm'>
                                {habit.habitId.slice(0, 10)}
                              </p> */}
                              <Button
                                type='button'
                                variant="ghost"
                                onClick={() => handleRemove(habit.habitId)}
                              >
                                <Trash 
                                  className='text-red-500 text-sm'
                                />
                              </Button>
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

            {/* HABITOS VINCULADOS  */}
            <div className='flex flex-col gap-3 max-w-180'>
              <Label>Hábitos vinculados: </Label>
              <Card className="px-4 py-4 max-h-40 overflow-auto">
                {habits.length !== 0 ? (
                  <div className='flex flex-col gap-2'>
                    {habits.map((habit) => (
                      <div key={habit.habitId} className='flex flex-row gap-4 justify-between items-center'>
                        <div className='flex min-w-22 flex-row gap-2 items-center'>
                          <Clock8Icon className='w-4 h-4' />
                          <p className='text-sm'>
                            {habit.clock}
                          </p>
                        </div>

                        <div className='flex flex-row gap-2 items-center'>
                          <AlarmClock className='w-4 h-4' />
                          <p className='text-sm'>
                            {habit.duration}
                          </p>
                        </div>

                        {/* <p className='w-full text-sm'>
                          {habit.habitId.slice(0, 10)}
                        </p> */}
                        <Button
                          type='button'
                          variant="ghost"
                          onClick={() => handleRemove(habit.habitId)}
                        >
                          <Trash 
                            className='text-red-500 text-sm'
                          />
                        </Button>
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
            disabled={isSubmitting}
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