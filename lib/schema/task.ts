import { z } from "zod"

export const MetricSchema = z.object({
  id: z.string().optional(),
  field: 
    z.string()
    .min(1, "O valor minimo de caracateres é 1"),
  value: 
    z.string()
    .min(1, "Ovalor minimo de caracteres é 1"),
  fieldType: 
    z.string()
    .optional(),
  unit: 
    z.string()
    .optional(),
  emoji: 
    z.string()
    .optional(),
})

export const CreateTaskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  isPLus: z.boolean().default(true).optional(),
  emoji: z.string().optional(),
  goals: z.string().optional(),
  categories: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
  limitCounter: z.coerce.number()
    .min(0, "O valor minimo a ser selecionado é igual a 1")
    .max(10, "O valor máximo a ser selecionado é igual a 10")
    .default(1)
    .optional(),
  counterId: z.string().optional()
})

export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  videoUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  isPLus: z.boolean().default(true).optional(),
  emoji: z.string().optional(),
  goals: z.string().optional(),
  categories: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
  status: z.enum(["ACTIVE", "ARCHIVED", "PAUSED"]).optional(),
  counter: z.coerce.number()
    .min(0, "O valor minimo a ser selecionado é igual a 1")
    .max(10, "O valor máximo a ser selecionado é igual a 10")
    .default(0)
    .optional(),
  limitCounter: z.coerce.number()
    .min(0, "O valor minimo a ser selecionado é igual a 1")
    .max(10, "O valor máximo a ser selecionado é igual a 10")
    .default(1)
    .optional(),
  counterId: z.string().optional(),
})

export type UpdateTaskSchemaType = z.infer<typeof UpdateTaskSchema>