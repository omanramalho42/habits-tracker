import { z } from "zod"
import { CreateMetricSchema, UpdateMetricSchema } from "./metrics"

export const createCounterSchema = z.object({
  label: 
    z.string()
    .min(2, "O valor minimo de caracateres permitido é igual a 2"),
  taskId: z.string(),
  emoji:
    z.string()
    .optional(),
  limit: 
    z.coerce.number()
    .min(1, "O valor minimo é 1"),
  index:
    z.string().optional(),
  valueNumber:
    z.coerce.number()
    .optional(),
  valueText: 
    z.string()
    .optional(),
  unit: 
    z.string()
    .optional(),
  metrics: 
    z.array(
      CreateMetricSchema
    )
    .optional()
})

export type CreateCounterSchemaType = z.infer<typeof createCounterSchema>

export const updateCounterSchema = z.object({
  id: z.string().optional(),
  counterStepId: z.string().optional(),
  label: 
    z.string()
    .min(2, "O valor minimo de caracateres permitido é igual a 2"),
  emoji: 
    z.string()
    .optional(),
  limit: 
    z.coerce.number()
    .min(1, "O valor minimo é 1"),
  valueNumber:
    z.coerce.number()
    .optional(),
  taskId: z.string(),
  valueText: 
    z.string()
    .optional(),
  unit: 
    z.string()
    .optional(),
  metrics: 
    z.array(
      UpdateMetricSchema
    )
    .optional()
})

export type UpdateCounterSchemaType = z.infer<typeof updateCounterSchema>