"use client"

import React from "react"
import {
  Control,
  useController,
  useFieldArray,
  useWatch,
} from "react-hook-form"

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
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"

import { Plus, Trash2 } from "lucide-react"

import type { CreateCounterSchemaType } from "@/lib/schema/counter"

interface CreateTaskMetricsProps {
  control: Control<CreateCounterSchemaType>
}

const CreateTaskMetrics: React.FC<CreateTaskMetricsProps> = ({ control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "taskMetric",
  })

  return (
    <div className="flex flex-col gap-4 z-50">
      <div className="flex flex-col gap-3 border p-4 rounded-xl">
        <div className="flex justify-between">
          <p className="text-sm font-medium">
            Complemento
          </p>

          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({
                field: "",
                value: "",
                fieldType: "NUMERIC",
                step: 0,
                isComplete: false,
                limit: "1",
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
    </div>
  )
}

interface CounterItemProps {
  control: Control<CreateCounterSchemaType>
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

  // const { field: value } = useController({
  //   control,
  //   name: `taskMetric.${index}.value`,
  // })

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
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  <Label>Nome</Label>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
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
          name={`taskMetric.${index}.limit`}
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

export default CreateTaskMetrics