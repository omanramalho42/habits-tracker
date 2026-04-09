"use client"

import React, { useState } from 'react'

import { Controller, SubmitHandler, useForm } from 'react-hook-form'

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"

import { format } from "date-fns"
import { toast } from 'sonner'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateRoutine } from '@/services/routines'

import MultiHabitsTasksPicker from '@/components/multi-habit-task-picker'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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
  PencilIcon,
} from 'lucide-react'

import type { UpdateRoutineSchemaType } from '@/lib/schema/routine'
import { WEEKDAYS } from '@/lib/habit-utils'
import { AICreator } from './tasks/ai-creator'
import { Textarea } from './ui/textarea'

interface UpdateRoutineDialogProps {
  trigger: React.ReactNode
  onSuccessCallback?: (data: UpdateRoutineSchemaType) => void
  routine: any
}

const UpdateRoutineDialog:React.FC<UpdateRoutineDialogProps> = ({ trigger, routine, onSuccessCallback }) => {
  const crons = [
    {value:"semanalmente", label:"semanalmente"},
    {value:"mensalmente", label: "mensalmente"},
    {value: "diariamente", label: "diariamente"},
  ]
  
  const [open, setOpen] = useState<boolean>(false)
  const today = new Date()
  today.setHours(0,0,0,0)

  // console.log({ routine }, "🪄!")

  const form = useForm<UpdateRoutineSchemaType>({
    defaultValues: {
      id: routine.id,
      name: routine.name,
      cron: routine?.cron || "",
      description: routine.description || "",
      emoji: routine.emoji || "",
      frequency: routine.frequency as string[] || [],
      dateRange: {
        from: routine.startDate,
        // to: routine?.endDate || null
      },
      habits: routine?.habitSchedules?.map((schedule: any) => schedule?.habit) || [],
      tasks: routine?.taskSchedules?.map((schedule: any) => schedule?.task) || [],
    }
  })
  
  const {
    handleSubmit,
    control,
    watch,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()
  
  const { isPending, mutate } = useMutation({
    mutationFn: updateRoutine,
    onMutate: () => {
      return toast.loading(
        "Atualizando rotina...",
        { id: "update-routine" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["routines"],
        exact: false,
      })

      toast.success(
        "Rotina atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar rotina",
        { id: toastId }
      )
    },
  })

  const onSubmit: SubmitHandler<UpdateRoutineSchemaType> = async (data: UpdateRoutineSchemaType) => {
    console.log(data, "values")

    mutate(data)

    setOpen(prev => !prev)
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
            <PencilIcon className="mr-2 h-4 w-4" />
            Editar
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn("bg-[#070B14]/80 backdrop-blur-xl border border-blue-500/40 rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.35)] text-white")}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            editar rotina
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

                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex flex-col items-start gap-1 justify-between">
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Descrição
                    </Label>

                    <AICreator
                      reference={form.watch("name")}
                      type="routine" 
                      onGenerated={
                        (text) => form.setValue("description", text)
                      } 
                    />
                  </div>

                  <FormField
                    control={control}
                    name="description"
                    rules={{ required: false, min: 5 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            id="description"
                            className="
                              bg-black/50
                              border border-white/10
                              focus:border-blue-500/60
                              focus:ring-1 focus:ring-blue-500/30
                              rounded-lg
                              text-white
                              placeholder:text-white/30"
                            placeholder='ex: coloque uma breve descrição da rotina'
                          />
                        </FormControl>
                        {errors && errors.description && (
                          <span className='text-red-500 text-sm'>
                            {errors.description.message}
                          </span>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={control}
                name="emoji"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem className="grid-cols-1">
                    <FormLabel htmlFor="icon" className='mb-1'>
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
            {/* <div className='flex flex-col gap-2'>
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
            </div> */}

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
            {/* <MultiHabitsPicker
              control={control}
            /> */}
            <MultiHabitsTasksPicker 
              control={control}
            />
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

export default UpdateRoutineDialog