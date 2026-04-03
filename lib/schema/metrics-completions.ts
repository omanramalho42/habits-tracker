import z from "zod"

export const createMetricCompletionsSchema = z.object({
  step: z.coerce.number(),
  isComplete: z.boolean().default(false),
  date: z.coerce.date(),
  value: 
    z.string()
    .min(1, "O valor minimo de caracteres é 1"),
  taskMetricId: z.string(),
  createdAt: z.coerce.date().default(new Date()).optional(),
})

export type CreateMetricCompletionsSchemaType = z.infer<typeof createMetricCompletionsSchema>

export const updateMetricCompletionsSchema = z.object({
  id: z.string(),
  step: z.coerce.number(),
  isComplete: z.boolean().default(false),
  date: z.coerce.date(),
  value: 
    z.string()
    .min(1, "O valor minimo de caracteres é 1"),
  taskMetricId: z.string(),
  updatedAt: z.coerce.date().default(new Date()).optional(),
})

export type updateMetricCompletionsSchemaType = z.infer<typeof updateMetricCompletionsSchema>