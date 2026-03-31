"use client"

import React, { useState } from 'react'
import axios from 'axios'

import { zodResolver } from "@hookform/resolvers/zod"

import {
  useForm
} from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import CreateTaskMetrics from '@/components/task-metrics/create-task-metrics'

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
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
import { Form } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { createCounterSchema, type CreateCounterSchemaType } from '@/lib/schema/counter'

interface CreateCounterDailogProps {
  trigger?: React.ReactNode
}

const CreateCounterDialog: React.FC<CreateCounterDailogProps> = ({
  trigger
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<CreateCounterSchemaType>({
    resolver: zodResolver(createCounterSchema),
    defaultValues: {
      emoji: "",
      label: "",
      unit: "",
      index: "",
      limit: 1,
      taskMetric: []
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isLoading,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn:  async (values: CreateCounterSchemaType) => {
      toast.loading("Criando contador...", {
        id: 'create-counter'
      })
      return await axios.post(
        `/api/counter`, values
      )
    },
    onSuccess: async () => {
      toast.success("Contador criado com sucesso! 🎉", {
        id: 'create-counter'
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "tasks"
        ]
      })
      await queryClient.invalidateQueries({
        queryKey: [
          "counter"
        ]
      })
    },
    onError: () => {
      toast.error("Erro ao criar contador...", {
        id: 'create-counter'
      })
    }
  })

  const onSubmit = async (values: CreateCounterSchemaType) => {
    console.log(values, "values counter")
    console.log(errors, "errors")

    mutate(values)

    reset()

    setOpen(prev => !prev)
  }

  console.log(errors, "errors");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
      >
        {trigger || (
          <Button
            type='button'
            role='combobox'
            variant='outline'
            size='default'
          >
            Criar novo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Criar contador
          </DialogTitle>
          <DialogDescription>
            Crie um contador personalizado que pode ser reutilizado em outras tarefas/hábitos
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className='flex flex-col gap-4'>
            
            <div className="flex justify-between gap-4 items-baseline">
              <FormField
                name="emoji"
                control={control}
                render={({ field }) => {
                  return (
                    <FormItem>
                      <FormLabel>
                        <Label>Emoji</Label>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="⚙️"
                          className="w-10"
                        />
                      </FormControl>
                    </FormItem>
                  )
                }}
              />
              <FormField
                name="label"
                control={control}
                rules={{ max: 12, min: 2, required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        className="text-sm font-semibold"
                        htmlFor="label"
                      >
                        Nome
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="label"
                        placeholder="ex: Páginas..."
                        onChange={field.onChange}
                        type="text"
                      />
                    </FormControl>
                    {errors.label && (
                      <span className="text-sm text-red-500">
                        {errors.label.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                name="limit"
                control={control}
                rules={{
                  min: 1,
                  max: 10,
                  required: true
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        htmlFor="limit"
                        className="text-sm font-semibold"
                      >
                        limite
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="limit"
                        value={field.value}
                        onChange={field.onChange}
                        type="number"
                      />
                    </FormControl>
                    {errors.limit && (
                      <span className="text-sm text-red-500">
                        {errors.limit?.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <CreateTaskMetrics
              control={control}
            />
          </form>
        </Form>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              role='button'
              variant="outline"
            >
              <p className='text-sm text-destructive tracking-tighter'>
                Cancelar
              </p>
            </Button>
          </DialogClose>
          <Button
            type='button'
            role='button'
            variant="default"
            disabled={isLoading || isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            <p className='text-sm tracking-tighter'>
              Salvar
            </p>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCounterDialog