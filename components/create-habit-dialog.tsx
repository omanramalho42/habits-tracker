"use client"

import { useState } from "react"

import {
  Controller,
  SubmitHandler,
  useForm
} from "react-hook-form"

import { z } from "zod"

import { HexColorPicker } from "react-colorful"

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

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"

import { useTheme } from "next-themes"

import { format } from "date-fns"

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

import { Switch } from "@/components/ui/switch"

import { cn } from "@/lib/utils"

import { WEEKDAYS } from "@/lib/habit-utils"

import {
  CalendarIcon,
  CircleOff,
  PlusSquare
} from "lucide-react"

import { toast } from 'sonner'
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"

export type HabitSchemaType = z.infer<typeof habitSchema>

interface CreateHabitDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: HabitSchemaType) => void
}

const habitSchema = z.object({
  name: z.string(),
  emoji: z.string().default("🌍"),
  goal: z.string().optional().default(""),
  motivation: z.string().optional().default(""),
  startDate: z.string().date(),
  endDate: z.string().date().optional().nullable(),
  reminder: z.boolean().optional().default(false),
  // z.enum(['M', 'T', 'W', 'TH', 'F', 'SA', 'S'])
  frequency: z.array(z.string()).default([]),
  color: z.string().optional().default("#3B82F6"),
})


export function CreateHabitDialog({ trigger, onSuccessCallback }: CreateHabitDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [color, setColor] = useState<boolean>(false)

  const theme = useTheme()

  const form = useForm<HabitSchemaType>({
    defaultValues: {
      name: "",
      goal: "",
      motivation: "",
      frequency: [],
      color: "",
      emoji: "",
      endDate: null,
      reminder: false,
      startDate: new Date().toISOString().split("T")[0]
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

  const onSubmit: SubmitHandler<HabitSchemaType> = async (data: HabitSchemaType) => {
    console.log("submmmitng")
    // toasters aqui
    const toastId =
      toast.loading(
        'Criando hábito....',
        { id: 'habits-create'}
      )
      console.log(data, "data")
    try {
      await onSuccessCallback?.(data)
      
      reset()

      setOpen(prev => !prev)

      toast.success(
        "Sucesso ao criar hábito", 
        { id: toastId }
      )
    } catch (error) {
      if(error instanceof Error) {
        console.log(error.message)
        return toast.error(
          "Sucesso ao criar hábito",
          { id: toastId }
        )
      }
    }
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

      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Criar um novo hábito
          </DialogTitle>
          {/* <DialogDescription>
            Hábitos são essencias para uma vida organizada
          </DialogDescription> */}
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3">

            {/* ICONE */}
            <FormField
              control={control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Icone
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full min-h-16 sm:min-h-25"
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
                              <CircleOff className="h-8 w-8 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Toque para selecionar
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom"
                        align="center"
                        className="
                          w-[90vw] max-w-sm
                          sm:w-105
                          p-0
                          max-h-[80vh]
                          overflow-hidden
                        "
                      >
                        <div className="max-h-[70vh]">
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

            <FormField
              name="name"
              rules={{ required: true, min: 5 }}
              render={({ field }) => (
                <FormItem>
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
                      className="mt-1.5"
                    />
                  </FormControl>
                  {errors.name && (<span className="text-sm text-red-500">{errors.name?.message}</span>)}
                </FormItem>
              )}
            />

            <FormField
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="goal"
                      className="text-sm font-semibold"
                    >
                      Objetivo
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="goal"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="exercitar 15 minutos por dia"
                      className="mt-1.5"
                    />
                  </FormControl>
                  {errors.goal && (<span className="text-sm text-red-500">{errors.goal?.message}</span>)}
                </FormItem>
              )}
            />
            <FormField
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="motivation"
                      className="text-sm font-semibold"
                    >
                      Motivação
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="motivation"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="melhorar suas notas escolares"
                      className="mt-1.5"
                    />
                  </FormControl>
                  {errors.motivation && (<span className="text-sm text-red-500">{errors.motivation?.message}</span>)}
                </FormItem>
              )}
            />

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
                        <FormLabel>
                          <Label className="text-sm font-semibold">
                            Data final
                          </Label>
                        </FormLabel>
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
                      {day.label}
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
