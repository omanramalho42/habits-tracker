import React, { useState } from 'react'

import { format } from 'date-fns'

import { EmojiPicker } from "frimousse"

import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import { Button } from '@/components/ui/button'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Card } from '@/components/ui/card'

import { cn } from '@/lib/utils'

import { 
  CalendarIcon,
  CircleOff,
  PlusSquare
} from 'lucide-react'

interface CreateCheckpointDialogProps {
  trigger: React.ReactNode;
}

const checkpointSchema = z.object({
  name: z.string(),
  description: z.string(),
  emoji: z.string(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.date().nullable()
  ).optional(),
})

export type CheckpointSchemaType = z.infer<typeof checkpointSchema>

const CreateCheckPointDialog:React.FC<CreateCheckpointDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState<boolean>(false)
  
  const today = new Date()
  today.setHours(0,0,0,0)

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      emoji: "",
      startDate: today,
      endDate: null,
    }
  })

  const {
    handleSubmit,
    control,
    watch,
    formState: {
      errors,
      isSubmitting,
      isLoading
    },
    reset
  } = form

  const onSubmit = (values: CheckpointSchemaType) => {
    console.log(values, "values")

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

      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Criar checkpoint
          </DialogTitle>
          <DialogDescription>
            criar checkpoint organiza seus objetivos
          </DialogDescription>  
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3">
            <FormField
              name='name'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold"
                    >
                      Nome
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='ex: Emagrecer...'
                    />
                  </FormControl>

                  {errors && errors.name && (
                    <span className='text-red-500 text-sm'>
                      {/* {errors.name.message} */}
                    </span>
                  )}
                </FormItem>
              )}
            />
            <FormField
              name='description'
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Descrição
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="description"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='ex: Conquistar o tão sonhado peso...'    
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

            {/* START DATE */}
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
            {/* END DATE */}
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch("endDate") ? format(watch('endDate')!, "PPP") : <span>Escolhe data final</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <FormField
                  name="endDate"
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
                      {errors.endDate && (<span className="text-sm text-red-500">{errors.endDate?.message}</span>)}
                    </FormItem>
                  )}
                />
                </PopoverContent>
              </Popover>
            </div>

            {/* ICONE */}
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
                            <Card className="w-full p-2 h-full cursor-pointer">
                              {field.value ? (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="text-3xl" role="img">
                                    {field.value}
                                  </span>

                                  <p className="text-xs text-center text-muted-foreground">
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
                              scroll-container
                              w-full
                              p-3
                              max-h-[70vh]
                              overflow-y-visible
                            "
                          >
                            <EmojiPicker.Root
                              className="flex flex-col gap-2"
                              onEmojiSelect={(emoji: any) => {
                                field.onChange(emoji.emoji)
                              }}
                            >
                              <EmojiPicker.Search className="w-full" />

                              <EmojiPicker.Viewport
                                className="h-72 overflow-y-auto"
                                style={{ WebkitOverflowScrolling: "touch" }}
                                onWheel={(e) => e.stopPropagation()}
                              >
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

          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type='button'
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCheckPointDialog