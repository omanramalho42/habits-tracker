"use client"

import React, { useState } from 'react'

import { Controller, useFieldArray, useForm } from 'react-hook-form'

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import z from 'zod'

import { motion, AnimatePresence } from "framer-motion" 
import { format } from "date-fns"

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
import { Calendar } from '@/components/ui/calendar'
import MultipleSelector from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardFooter } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import {
  AlarmClock,
  CalendarIcon,
  CircleOff,
  Clock8Icon,
  Edit,
  PlusSquare,
  Trash
} from 'lucide-react'

interface CreateRoutineDialogProps {
  trigger: React.ReactNode
}

const routineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date()
  }),
  cron: z.string(),
  frequency: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      key: z.string()
    })
  ),
  habits: z.array(
    z.object({
      habitId: z.string().min(1, "Selecione um hábito"),
      clock: z.string().min(1, "Horário é obrigatório"),
      duration: z.string().min(1, "Duração é obrigatória"),
    })
  )
})

export type CreateRoutineSchemaType = z.infer<typeof routineSchema>

const CreateRoutineDialog:React.FC<CreateRoutineDialogProps> = ({ trigger }) => {
  const [openModal, setOpenModal] =
    useState<boolean>(false)
  const [isFlying, setIsFlying] =
    useState<boolean>(false)

  const addButtonRef =
    React.useRef<HTMLButtonElement>(null)

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

  const handleAdd = async () => {
    const isValidHabitId =
      await triggerRHF(`habits.${fields.length}.habitId`)
    const isValidHabitClock = 
      await triggerRHF(`habits.${fields.length}.clock`)
    const isValidHabitDuration = 
      await triggerRHF(`habits.${fields.length}.duration`)
    
    const isValid = 
      isValidHabitId && 
      isValidHabitClock && 
      isValidHabitDuration
    
    if(!isValid) {
      if(!isValidHabitId) {
        setError(
          `habits.${fields.length}.habitId`,
          { message: "Vincule pelo menos 1 hábito" })
      }
      if(!isValidHabitClock) {
        setError(
          `habits.${fields.length}.clock`,
          { message: "Campo requerido" })
      }

      if(!isValidHabitDuration) {
        setError(
          `habits.${fields.length}.duration`,
          { message: "Campo requerido" })
      }

      return
    }

    const currentHabits =
      form.getValues("habits")

    console.log(currentHabits, "current habits")
    append({
      habitId: currentHabits[fields.length].habitId,
      clock: currentHabits[fields.length].clock,
      duration: currentHabits[fields.length].duration
    })
    // if (!addButtonRef.current) return

    // setIsFlying(true)

    // // simula duração da animação
    // setTimeout(() => {
    //   setIsFlying(false)
    // }, 700)
  }

  const handleRemove = (habitId: string) => {
    const currentHabits = form.getValues("habits")

    form.setValue(
      "habits",
      currentHabits.filter(h => h.habitId !== habitId)
    )
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
      dateRange: { from: today },
      habits: []
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "habits"
  })

  const onSubmit = (values: CreateRoutineSchemaType) => {
    console.log(values, "values");
    // setHabits([])
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
          <form className='space-y-2'>

            <div className="flex flex-row gap-2">
              <div className="flex w-[75%] flex-col gap-1">
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
              </div>
              <div className='flex-1'>
                <FormField
                  control={control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem className="grid-cols-1">
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
                                  <p className="text-xs text-muted-foreground text-center">
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
              </div>
            </div>
            
            {/* DATAS */}
            <div className='flex flex-col gap-1 w-full'>
              <Label className="text-sm font-semibold block">
                Data
              </Label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watch('dateRange') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('dateRange')?.from ? (
                      watch('dateRange').to ? (
                        <>
                          {format(watch('dateRange').from, "dd/MM/yyyy")} -{" "}
                          {format(watch('dateRange').to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(watch('dateRange').from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Escolha o intervalo de datas</span>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                  <FormField
                    name="dateRange" // Recomendo mudar de 'startDate' para 'dateRange' para ficar claro que é um objeto
                    control={control} // Certifica-te de passar o control do useForm
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2} // Opcional: mostra 2 meses para facilitar o range
                          />
                        </FormControl>
                        {errors.dateRange && (
                          <span className="text-xs text-red-500 px-2 pb-2 block">
                            {errors.dateRange?.message}
                          </span>
                        )}
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* CRONOGRAMA */}
            <div className='flex flex-col gap-2'>
              <Label>Cronograma</Label>
              <Controller
                control={control}
                name='cron'
                render={({ field }) => {
                  return (
                    <div className='w-full'>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Selecione o cronograma' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Cronograma</SelectLabel>
                            {crons.map((item, index) => {
                              return (
                                <SelectItem 
                                  key={index}
                                  value={item.value}
                                >
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
            {/* FREQUENCIA */}
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

                  <div className="flex flex-row justify-between gap-3">
                    <FormField
                      name={`habits.${fields.length}.clock`}
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
                      name={`habits.${fields.length}.duration`}
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
                  </div>
                  
                  <div className="flex flex-col gap-2 w-full">
                    <Label
                      htmlFor="habits"
                      className={cn(errors.habits && errors.habits[fields.length]?.habitId && 'text-red-500 font-semibold')}
                    >
                      Vincular hábito
                    </Label>
                    <HabitPicker
                      index={fields.length}
                      control={control}
                    />
                  </div>

                  {/* HABITOS VINCULADOS  */}
                  <div className='flex flex-col gap-3'>
                    <Label>Hábitos vinculados: </Label>
                    <Card className="px-4 py-4 max-h-40 overflow-auto">
                      {fields.length !== 0 ? (
                        <div className='flex flex-col gap-2'>
                          {fields.map((habit, index) => (
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
                                  onClick={() => handleRemove(habit.habitId)}
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
                {fields.length !== 0 ? (
                  <div className='flex flex-col gap-2'>
                    {fields.map((habit) => (
                      <div
                        key={habit.habitId}
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

                        <div className='flex flex-row gap-2'>
                          <Button
                            type='button'
                            variant="ghost"
                            onClick={() => handleRemove(habit.habitId)}
                          >
                            <Trash
                              className='text-red-500 text-sm'
                            />
                          </Button>
                          <Button
                            type='button'
                            variant="ghost"
                            onClick={() => {
                              setOpenModal(prev => !prev)
                            }}
                            disabled={true}
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