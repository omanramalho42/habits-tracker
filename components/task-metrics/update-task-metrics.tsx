"use client"

import React, { useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Pencil, Save, Trash } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TaskMetric } from "@prisma/client"

interface UpdateMetricsCounterProps {
  metrics?: TaskMetric[]
  trigger?: React.ReactNode
  open?: boolean;
  onSave?: (data: UpdateTaskMetricSchemaType[]) => void
}

const updateTaskMetricSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  limit: z.string(),
  value: z.string(),
  emoji: z.string().optional(),
})

type UpdateTaskMetricSchemaType = z.infer<typeof updateTaskMetricSchema>

const UpdateMetricsCounter: React.FC<UpdateMetricsCounterProps> = ({
  metrics = [],
  open: openMetricsDialog = false,
  trigger,
}) => {
  const [open, setOpen] = useState(openMetricsDialog)

  const form = useForm<{ metrics: UpdateTaskMetricSchemaType[] }>({
    resolver: zodResolver(
      z.object({
        metrics: z.array(updateTaskMetricSchema),
      })
    ),
    defaultValues: {
      metrics: metrics?.map((m) => ({
        id: m.id,
        label: m.field,
        value: String(m.value || ""),
        emoji: m.emoji || "",
      })),
    },
  })

  const { control, handleSubmit } = form

  const onSubmit: SubmitHandler<{ metrics: UpdateTaskMetricSchemaType[] }> = (
    data
  ) => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            type="button"
            role="combobox"
            variant="outline"
            size="default"
            className="w-full flex items-center gap-2"
          >
            <Pencil className="w-3 h-3" />
            <span className="text-sm font-normal truncate tracking-tighter">
              Editar métricas
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar métricas</DialogTitle>
          <DialogDescription>
            Atualize os detalhes das métricas do contador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {metrics.map((metric, index) => (
            <div
              key={metric.id}
              className="flex flex-col gap-2 border rounded p-2"
            >
              <Controller
                name={`metrics.${index}.name`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Nome da métrica" />
                )}
              />
              <Controller
                name={`metrics.${index}.description`}
                control={control}
                render={({ field }) => (
                  <Textarea {...field} placeholder="Descrição" />
                )}
              />
              <div className="flex gap-2">
                <Controller
                  name={`metrics.${index}.limit`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Limite" type="number" />
                  )}
                />
                <Controller
                  name={`metrics.${index}.value`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Valor atual" type="number" />
                  )}
                />
                <Controller
                  name={`metrics.${index}.emoji`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} placeholder="Emoji" />
                  )}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="flex gap-2">
                <Trash className="w-3 h-3 text-destructive" />
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" variant="outline" size="sm" className="flex gap-2">
              <Save className="w-3 h-3" />
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateMetricsCounter