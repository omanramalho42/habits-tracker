"use client"

import React, { useState } from 'react'
import axios from 'axios'

import { zodResolver } from "@hookform/resolvers/zod"

import {
  useForm
} from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import UpdateTaskMetrics from '@/components/task-metrics/update-task-metrics'

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

import type {
  Counter,
  CounterStep,
  TaskMetric,
  TaskMetricCompletion
} from '@prisma/client'
import { updateCounterSchema, type UpdateCounterSchemaType } from '@/lib/schema/counter'
import { formatDateBR } from '@/lib/utils'

interface UpdateCounterDialog {
  trigger?: React.ReactNode
  taskId: string
  selectedDate: Date
  counter: (Counter & {
    CounterStep: CounterStep[]
  })
  metrics?: (TaskMetric & {
    taskMetricCompletion?: TaskMetricCompletion[]
  })[]
}

const UpdateCounterDialog: React.FC<UpdateCounterDialog> = ({
  trigger,
  counter,
  metrics,
  selectedDate,
  taskId
}) => {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<UpdateCounterSchemaType>({
    resolver: zodResolver(updateCounterSchema),
    defaultValues: {
      id: counter.id,
      emoji: counter.emoji || "",
      //⚠️
      counterStepId: counter.CounterStep[0]?.id || "",
      label: counter.label || "",
      unit: counter.unit || "",
      limit: counter.limit || 1,
      taskId: taskId,
      metrics: metrics?.map((metric) => {
        return {
          emoji: metric.emoji || "",
          field: metric?.field || "",
          fieldType: metric?.fieldType || "",
          unit: metric?.unit || ""
        }
      })
    }
  })

  const selectedDateStr =
    formatDateBR(selectedDate)

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

  const { mutate, data } = useMutation({
    mutationFn:  async (values: UpdateCounterSchemaType) => {
      toast.loading("Atualizando contador...", {
        id: 'update-counter'
      })
      return await axios.patch(
        `/api/counter/${values.id}${selectedDate ? `?selectedDate=${selectedDateStr}` : ""}`,
        values
      )
    },
    onSuccess: async () => {
      toast.success("Contador atualizado com sucesso! 🎉", {
        id: 'update-counter'
      })

      await queryClient.invalidateQueries({
        queryKey: ["tasks"]
      })
      await queryClient.invalidateQueries({
        queryKey: [
          "counter"
        ]
      })
    },
    onError: () => {
      toast.error("Erro ao atualizar contador...", {
        id: 'update-counter'
      })
    }
  })

  const onSubmit = async (values: UpdateCounterSchemaType) => {
    console.log(values, "values counter")
    console.log(errors, "errors")

    mutate(values)

    reset()

    setOpen(prev => !prev)
  }

  console.log(counter, "counter")
  console.log(metrics, "metrics")
  console.log(errors, "errors")

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
      <DialogContent className='w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            Editar contador
          </DialogTitle>
          <DialogDescription>
            edite um contador personalizado que pode ser reutilizado em outras tarefas/hábitos
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
                        htmlFor="field"
                      >
                        Nome
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="field"
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

            <UpdateTaskMetrics
              control={control}
              metrics={metrics}
            />
          </form>
        </Form>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type='button'
              role='button'
              variant="outline"
              disabled={false}
              onClick={() => {
                reset()
              }}
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

export default UpdateCounterDialog