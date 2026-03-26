import { z } from "zod"
import { MetricSchema } from "./task"

export const createCounterSchema = z.object({
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
  valueText: 
    z.string()
    .optional(),
  unit: 
    z.string()
    .optional(),
  metrics: 
    z.array(
      MetricSchema
    )
    .optional()
})

export type CreateCounterSchemaType = z.infer<typeof createCounterSchema>
