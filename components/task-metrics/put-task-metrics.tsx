"use client"

import React from "react"

import {
  useFieldArray,
  useForm,
  useWatch,
  useController,
  Control,
} from "react-hook-form"

import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Plus, Trash2, Save } from "lucide-react"

import type { Counter, TaskMetric, TaskMetricCompletion } from "@prisma/client"

import type { PutMetricSchemaType } from "@/lib/schema/metrics"
import { toast } from "sonner"

interface PutTaskMetricsProps {
  taskMetric: (TaskMetric & {
    counter?: Counter
    completion?: TaskMetricCompletion[]
  })[]
  taskId: string
  counterId: string
  trigger?: React.ReactNode
  selectedDate: any
  disabled?: boolean
  index: Number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const PutTaskMetrics: React.FC<PutTaskMetricsProps> = ({
  taskMetric,
  taskId,
  counterId,
  trigger,
  open,
  index,
  disabled = false,
  selectedDate,
  onOpenChange,
}) => {

  // 🔥 MAPEAMENTO FORA DO useForm
  const defaultValues: {
    taskMetric: PutMetricSchemaType
  } = {
    taskMetric:
      taskMetric?.map((m) => ({
        id: m.id,

        value: "",
        index: index.toString(),
        isComplete: false,

        field: m.field ?? "",
        fieldType: m.fieldType ?? "numeric",
        completionId: m.completionId || "",
        counterId: m.counterId,

        limit: Number(m.limit ?? 1),
        unit: m.unit ?? "",
        emoji: m.emoji ?? "",
      })) ?? [],
  }

  const form = useForm<{
    taskMetric: PutMetricSchemaType
  }>({
    defaultValues,
  })

  const { control, handleSubmit } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskMetric",
  })

  const queryClient = useQueryClient()
  // 🔥 MUTATION
  const mutation = useMutation({
    mutationFn: async (
      data: {
        taskMetric: PutMetricSchemaType, 
        date: Date
      }) => {
        toast.loading("Criando métricas...", {
          id: "create-metrics-completion"
        })
        const response = await axios.put(
          `/api/task/${taskId}/${counterId}`, {
            date: data.date,
            taskMetric: data.taskMetric
          }
        )
        return response.data
    },
    onSuccess: async () => {
      toast.success("Sucesso ao cadastrar métricas. 🎉", {
        id: "create-metrics-completion"
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
      console.log("✅ Metrics atualizadas")
      onOpenChange(false)
    },
    onError: (err) => {
      toast.error("Houve um erro ao cadastrar métricas", {
        id: "create-metrics-completion"
      })
      console.error("❌ Erro", err)
    },
  })

  const onSubmit = (data: { taskMetric: PutMetricSchemaType }) => {
    console.log("📤 ENVIANDO:", data)

    mutation.mutate({
      taskMetric: data.taskMetric,
      date: (selectedDate || new Date()).toISOString()
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            role="combobox"
            aria-expanded={open}
            variant="outline"
            size="default"
            type="button"
            disabled={disabled}
            className=""
          >
            <p className="text-md font-bold text-primary tracking-tighter truncate">
              Inserir registros
            </p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="tracking-tighter text-sm">
            Inserir métricas personalizadas
          </DialogTitle>
          <DialogDescription className="tracking-tighter text-sm">
            Insira métricas personalizadas
          </DialogDescription>
        </DialogHeader>
        {/* 🔥 KEY FORÇA RE-MOUNT */}
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3 border p-4 rounded-xl">
              <div className="flex justify-between">
                <p className="text-sm font-medium">
                  Complemento
                </p>

                <Button
                  role="button"
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled
                  onClick={() =>
                    append({
                      field: "",
                      value: "",
                      fieldType: "numeric",
                      index: "1",
                      completionId: "",
                      isComplete: false,
                      limit: 1,
                      unit: "",
                      emoji: "",
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>

              {fields.map((item, index) => (
                <CounterItem
                  key={item.id}
                  control={control}
                  index={index}
                  remove={remove}
                />
              ))}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  role="button"
                  variant="outline"
                  size="default"
                >
                  <p className="text-sm font-medium text-destructive">
                    Cancelar
                  </p>
                </Button>
              </DialogClose>
              <Button
                role="button"
                variant="outline"
                size="default"
                type="button"
                disabled={mutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                <Save className="w-4 h-4 mr-2" />
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface CounterItemProps {
  control: Control<{ taskMetric: PutMetricSchemaType }>
  index: number
  remove: (index: number) => void
}

const CounterItem: React.FC<CounterItemProps> = ({
  control,
  index,
  remove,
}) => {
  const type = useWatch({
    control,
    name: `taskMetric.${index}.fieldType`,
  })

  // const { field: label, fieldState: { error: labelError } } = useController({
  //   control,
  //   name: `taskMetric.${index}.label`,
  // })

  const {
    field: value,
    fieldState: {
      error: valueError
    }
  } = useController({
    control,
    name: `taskMetric.${index}.value`,
  })

  // const { field: emoji } = useController({
  //   control,
  //   name: `taskMetric.${index}.emoji`,
  // })

  // const { field: unitField } = useController({
  //   control,
  //   name: `taskMetric.${index}.unit`,

  const { field: typeField } = useController({
    control,
    name: `taskMetric.${index}.fieldType`,
  })

  const { field: unit } = useController({
    control,
    name: `taskMetric.${index}.unit`,
  })

  return (
    <div className="flex flex-col gap-2 border rounded-lg p-3">
      <div className="flex place-items-center-safe gap-2">
        <FormField
          name={`taskMetric.${index}.emoji`}
          control={control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Label>Emoji</Label>
                </FormLabel>
                <FormControl>
                  <Input
                    disabled
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
          control={control}
          name={`taskMetric.${index}.field`}
          rules={{
            required: true
          }}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Label>Nome</Label>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex: carga"
                  />
                </FormControl>
                {/* {labelError && (
                  <span className="text-destructive text-sm truncate max-w-25 tracking-tighter">
                    {labelError.message}
                  </span>
                )} */}
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={`taskMetric.${index}.value`}
          rules={{
            required: true
          }}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Label>Valor</Label>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex: 10"
                  />
                </FormControl>
                {valueError && (
                  <span className="text-destructive text-sm truncate max-w-25 tracking-tighter">
                    {valueError.message}
                  </span>
                )}
              </FormItem>
            )
          }}
        />
        <FormField
          control={control}
          name={`taskMetric.${index}.limit`}
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Label>Limite</Label>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    disabled
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ex: 12"
                  />
                </FormControl>
                {/* {labelError && (
                  <span className="text-destructive text-sm truncate max-w-25 tracking-tighter">
                    {labelError.message}
                  </span>
                )} */}
              </FormItem>
            )
          }}
        />

        <Button
          type="button"
          role="button"
          variant="outline"
          size="icon-sm"
          disabled
          onClick={() => remove(index)}
        >
          <Trash2 className="text-destructive text-sm tracking-tighter" />
        </Button>
      </div>

      <Select
        value={typeField.value}
        onValueChange={typeField.onChange}
      >
        <SelectTrigger>
          <SelectValue
            placeholder="Tipo"
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="currency">
            💰 Monetário
          </SelectItem>
          <SelectItem value="numeric">
            🔢 Numérico
          </SelectItem>
          <SelectItem value="liquid">
            💧 Líquido
          </SelectItem>
          <SelectItem value="distance">
            📏 Distância
          </SelectItem>
          <SelectItem value="weight">
            ⚖️ Peso
          </SelectItem>
        </SelectContent>
      </Select>

      {/* UNIT DINÂMICO */}
      {type === "currency" && (
        <Select
          value={unit.value}
          onValueChange={unit.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Moeda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BRL">R$</SelectItem>
            <SelectItem value="USD">$</SelectItem>
            <SelectItem value="EUR">€</SelectItem>
          </SelectContent>
        </Select>
      )}

      {type === "liquid" && (
        <Select
          value={unit.value}
          onValueChange={unit.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ml">ml</SelectItem>
            <SelectItem value="l">L</SelectItem>
          </SelectContent>
        </Select>
      )}

      {type === "distance" && (
        <Select
          value={unit.value}
          onValueChange={unit.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Unidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cm">cm</SelectItem>
            <SelectItem value="m">m</SelectItem>
            <SelectItem value="km">km</SelectItem>
          </SelectContent>
        </Select>
      )}
      {/* UNIT */}
      {type === "weight" && (
        <Select value={unit.value} onValueChange={unit.onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Peso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kg">kg</SelectItem>
            <SelectItem value="g">g</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  )
}


export default PutTaskMetrics