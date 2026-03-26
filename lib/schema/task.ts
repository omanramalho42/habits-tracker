import { z } from "zod"
<<<<<<< Updated upstream
=======

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
>>>>>>> Stashed changes

export const CreateTaskSchema = z.object({
  name: z.string(),
  emoji: z.string().optional(),
  goal: z.string().optional(),
  categorie: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
<<<<<<< Updated upstream
  limitCounter: z.coerce.number(),
=======
  limitCounter: z.coerce.number()
    .min(0, "O valor minimo a ser selecionado é igual a 1")
    .max(10, "O valor máximo a ser selecionado é igual a 10")
    .default(1)
    .optional(),
  counterId: z.string().optional()
>>>>>>> Stashed changes
})

export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
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