import { z } from "zod"

export const CreateTaskSchema = z.object({
  name: z.string(),
  emoji: z.string().optional(),
  goal: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
  limitCounter: z.coerce.number(),
})

export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  emoji: z.string().optional(),
  goal: z.string().optional(),
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
  // color: z.string().optional().default("#3B82F6"),
  updatedAt: z.coerce.date().optional(),
})

export type UpdateTaskSchemaType = z.infer<typeof UpdateTaskSchema>