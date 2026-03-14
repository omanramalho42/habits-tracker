"use client"

import React, { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { EmojiPicker } from "frimousse"

import { format } from "date-fns"
import { toast } from 'sonner'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createRoutine } from '@/services/routines'

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
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'

import {
  CalendarIcon,
  CircleOff,
  PlusSquare,
} from 'lucide-react'

import type { CreateRoutineSchemaType } from '@/lib/schema/routine'
import MultiHabitsPicker from './multi-habit-picker-dialog'
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group'
import { WEEKDAYS } from '@/lib/habit-utils'

interface CreateRoutineDialogProps {
  trigger: React.ReactNode
}

const CreateRoutineDialog:React.FC<CreateRoutineDialogProps> = ({ trigger }) => {
  const crons = [
    {value:"semanalmente", label:"semanalmente"},
    {value:"mensalmente", label: "mensalmente"},
    {value: "diariamente", label: "diariamente"},
  ]

  const [open, setOpen] = useState<boolean>(false)
  const today = new Date()
  today.setHours(0,0,0,0)

  const form = useForm<CreateRoutineSchemaType>({
    defaultValues: {
      name: "",
      cron: "",
      description: "",
      frequency: [],
      dateRange: {
        from: today
      },
      habits: []
    }
  })

  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateRoutineSchemaType) => {
      console.log(values, "values")
      return await createRoutine(values)
    },
    onSuccess: async () => {
      toast.success("Rotina criada com sucesso! 🎉", {
        id: "create-routine"
      })

      reset()

      await queryClient.invalidateQueries({
        queryKey: [
          "routines"
        ]
      })

      setOpen((prev) => !prev)
    },
    onError: () => {
      toast.error("Erro ao criar rotina", {
        id: "create-routine",
      })
    }
  })

  const onSubmit = (values: CreateRoutineSchemaType) => {
    console.log(values, 'values')
    toast.loading("Criando rotina...", {
      id: "create-routine"
    })

    mutate(values)
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
        className={cn("bg-[#070B14]/80 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.35)] text-white")}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Criar rotina
          </DialogTitle>
          <DialogDescription className="text-sm text-blue-100/60">
            Rotinas servem para gerenciar melhor o seu dia
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form className='space-y-2'>

            <div className="grid grid-cols-3 justify-start items-start gap-3">
              {/* ICONE */}
              <div className="flex col-span-2 flex-col items-stretch gap-2">
                <FormField
                  name='name'
                  disabled={isPending}
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
                          disabled={isPending}
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
                  disabled={isPending}
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
              <FormField
                control={control}
                name="emoji"
                render={() => (
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
                              <Card className="w-full h-full cursor-pointer">
                                {field.value ? (
                                  <div className="flex flex-col items-center justify-center gap-1 px-2">
                                    <span className="text-3xl" role="img">
                                      {field.value}
                                    </span>

                                    <p className="text-xs text-muted-foreground">
                                      Toque para trocar
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center gap-1 px-2">
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
                              align="end"
                              className="
                                scroll-container
                                w-full
                                p-3
                                max-h-[70vh]
                                overflow-hidden
                              "
                            >
                              <EmojiPicker.Root
                                className="flex flex-col gap-2"
                                onEmojiSelect={(emoji: any) => {
                                  field.onChange(emoji.emoji)
                                }}
                              >
                                <EmojiPicker.Search className="w-full" />

                                <EmojiPicker.Viewport className="h-72 overflow-y-auto">
                                  <EmojiPicker.Loading>
                                    Carregando…
                                  </EmojiPicker.Loading>

                                  <EmojiPicker.Empty>
                                    Nenhum emoji encontrado
                                  </EmojiPicker.Empty>

                                  <EmojiPicker.List />
                                </EmojiPicker.Viewport>
                              </EmojiPicker.Root>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              />
            </div>
            
            {/* DATAS */}
            <div className='flex flex-col gap-1 w-full'>
              <Label className="text-sm font-semibold block">
                Data
              </Label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={isPending}
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watch('dateRange') && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('dateRange')?.from ? (
                      watch('dateRange')?.to ? (
                        <>
                          {format(watch('dateRange').from, "dd/MM/yyyy")} - {" "}
                          {watch('dateRange')?.to && format(watch('dateRange').to!, "dd/MM/yyyy")}
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
                    disabled={isPending}
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
                      <Select
                        disabled={isPending}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
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
            {/* <div className='flex flex-col gap-2 items-start'>
              <Label>Frequencia</Label>
              <Controller
                control={control}
                name='frequency'
                disabled={isPending}
                render={({ field }) => {
                  return (
                    <MultipleSelector
                      commandProps={{
                        label: 'Selecione a frequencia'
                      }}
                      onChange={(value) => {
                        console.log(value, "value")
                        field.onChange(value)
                      }}
                      disabled={isPending}
                      value={field.value}
                      defaultOptions={frequency}
                      placeholder='Selecione a frequencia'
                      hideClearAllButton
                      hidePlaceholderWhenSelected
                      emptyIndicator={
                        <p className='text-center text-sm'>
                          Nenhum resultado encontrado
                        </p>
                      }
                      className='w-full'
                    />
                  )
                }}
              />
            </div> */}
            <Label>Frequência</Label>
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
            
            <Label>Vincular hábitos</Label>
            <MultiHabitsPicker control={control} />
          </form>
        </Form>

        <DialogFooter className='flex flex-row-reverse'>
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