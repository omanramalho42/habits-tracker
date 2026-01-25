"use client"

import { useCallback, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Controller,
  useForm
} from "react-hook-form"

import { HexColorPicker } from "react-colorful"
import { toast } from 'sonner'

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"

import { format } from "date-fns"

import { CreateHabit } from "@/app/habits/_actions/habits/habits"

import GoalPicker from "@/components/goal-picker"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Card } from "./ui/card"

import { cn } from "@/lib/utils"

import { WEEKDAYS } from "@/lib/habit-utils"

import {
  CalendarIcon,
  CircleOff,
  Clock8Icon,
  PlusSquare
} from "lucide-react"

import type { CreateHabitSchemaType } from "@/lib/schema/habit"

interface CreateHabitDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: CreateHabitSchemaType) => void
}

export function CreateHabitDialog({ trigger }: CreateHabitDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [color, setColor] = useState<boolean>(false)

  const today = new Date()
  today.setHours(0,0,0,0)

  const form = useForm<CreateHabitSchemaType>({
    defaultValues: {
      name: "",
      goal: "",
      clock: "",
      frequency: [],
      color: "",
      emoji: "",
      limitCounter: 1,
      custom_field: "",
      duration: "",
      endDate: null,
      reminder: false,
      startDate: today
    }
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateHabitSchemaType) => {
      console.log(values, "values")
      return await CreateHabit(values)
    },
    onSuccess: async () => {
      toast.success("Habito criado com sucesso! 🎉", {
        id: "create-habit"
      })

      reset({
        color: "",
        emoji: "",
        endDate: null,
        frequency: [],
        goal: "",
        clock: "",
        name: "",
        limitCounter: 1,
        reminder: false,
        custom_field: "",
        duration: "",
        startDate: today,
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "habits"
        ]
      })

      setOpen(prev => !prev)
    },
    onError: () => {
      toast.error("Aconteceu algo errado", {
        id: "create-habit",
      })
    },
  })

  const onSubmit = useCallback((values: CreateHabitSchemaType) => {
    console.log(values, 'values')
    toast.loading("Criando hábito....", { id: "create-habit" })

    mutate(values)
  },[])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar novo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Criar um novo hábito
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3">

            <div className="grid grid-cols-3 justify-start items-start gap-3">
              {/* ICONE */}
              <div className="flex flex-col">
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
              </div>

              <div className="w-full col-span-2 flex flex-col gap-3 justify-start items-start">
                <FormField
                  name="name"
                  rules={{ required: true, min: 5 }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <Label
                          htmlFor="name"
                          className="text-sm font-semibold"
                        >
                          Nome do hábito
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Acordar cedo pelas manhãs.."
                          className="truncate"
                        />
                      </FormControl>
                      {errors.name && (<span className="text-sm text-red-500">{errors.name?.message}</span>)}
                    </FormItem>
                  )}
                />
                
                {/* GOALS */}
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="goal" className="text-sm font-medium">
                    Vincular Objetivo
                  </Label>
                  <GoalPicker
                    control={control}
                    onSuccessCallback={() => {}}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-row justify-between gap-3">
              <FormField
                name="clock"
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
                          <Clock8Icon className='size-4' />
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
                          <Clock8Icon className='size-4' />
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

            <div className="flex justify-between gap-4 items-center">
              <FormField
                name="custom_field"
                rules={{ max: 12 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        className="text-sm font-semibold"
                        htmlFor="custom_field"
                      >
                        descrição
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="custom_field"
                        placeholder="ex: folhas..."
                        onChange={field.onChange}
                        type="text"
                      />
                    </FormControl>
                    {errors.custom_field && (<span className="text-sm text-red-500">{errors.custom_field.message}</span>)}
                  </FormItem>
                )}
              />
              <FormField
                name="limitCounter"
                control={control}
                rules={{ min: 1, max: 10 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        htmlFor="counter"
                        className="text-sm font-semibold"
                      >
                        Contador
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="limitCounter"
                        value={field.value}
                        onChange={field.onChange}
                        type="number"
                      />
                    </FormControl>
                    {errors.limitCounter && (<span className="text-sm text-red-500">{errors.limitCounter?.message}</span>)}
                  </FormItem>
                )}
              />
            </div>

            {/* DATA INICIAL */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Data inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !watch('startDate') && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate') ? format(watch('startDate'), "PPP") : <span>Escolha a data</span>}
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
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={field.onChange}
                          />
                        </FormControl>
                        {errors.startDate && (<span className="text-sm text-red-500">{errors.startDate?.message}</span>)}
                      </FormItem>
                    )}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* REMINDER */}
            <div className="flex flex-col gap-2 justify-between items-start">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <FormField
                    control={control}
                    name="reminder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <Label
                            htmlFor="reminder"
                            className="text-sm text-muted-foreground cursor-pointer"
                          >
                            Terminar
                          </Label>
                        </FormLabel>
                        <FormControl>
                          <Switch
                            id="reminder"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* SUBSTITUIR POR UM RANGE PARA REMOVER ESTE CAMPO */}
              {watch('reminder') && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !watch('endDate') && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watch("endDate") ? format(watch('endDate')!, "PPP") : <span>Escolhe data final</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                  <FormField
                    name="endDate"
                    rules={{ required: !watch('reminder') }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Calendar
                            {...field}
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={field.onChange}
                            disabled={(date) => date < (watch('startDate') ? new Date(watch('startDate')) : new Date()) || isSubmitting}
                          />
                        </FormControl>
                        {watch('reminder') && errors.endDate && (<span className="text-sm text-red-500">{errors.endDate?.message}</span>)}
                      </FormItem>
                    )}
                  />
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            {/* alldays */}
            <div className="flex flex-col justify-start gap-1">
              <Label htmlFor="allDays" className="text-sm font-semibold">
                Todos os dias
              </Label>
              <Switch
                id="allDays"
                checked={watch("frequency").length === WEEKDAYS.length}
                onCheckedChange={() => {
                  const allDays: string[] =
                    WEEKDAYS.map((day) => day.label)
                  
                  if (watch("frequency").length === allDays.length) {
                    return form.setValue("frequency", [])
                  }

                  form.setValue("frequency", allDays)
                }}
              />
            </div>

            <Controller
              name="frequency"
              render={({ field }) => (
                <ToggleGroup
                  type="multiple"
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex w-full gap-2"
                >
                  {WEEKDAYS.map((day) => (
                    <ToggleGroupItem
                      key={day.key}
                      value={day.label}
                      className="flex-1"
                    >
                      {day.keyPtBr}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            />

            {/* COLOR PICKER */}
            <Dialog open={color} onOpenChange={setColor}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  variant="outline"
                >
                  Selecione a cor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Selecione a cor</DialogTitle>
                  <DialogDescription>
                    Selecione a cor movendo o ponteiro em cima da cor desejada
                    em baixo selecione a tonalidade para te auxiliar
                  </DialogDescription>
                </DialogHeader>
                <div className="flex w-full justify-center items-center">
                  <Controller
                    name="color"
                    render={({ field }) => (
                      <HexColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={() => setColor((prev) => !prev)}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <DialogFooter className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen
                  }}
                  className="flex-1 bg-transparent"
                  disabled={!isSubmitting}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 shadow-md"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Criando..." : "Criar hábito"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}
