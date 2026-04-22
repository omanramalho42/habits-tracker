import { z } from "zod"

export const CreateTaskSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  
  videoUrl: z.any().optional().nullable(),
  imageUrl: z.any().optional().nullable(),

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
  counterId: z.string().optional(),
  // ... outros campos
  emojiId: z.string().optional(), // ID do Emoji
  // ... resto do schema
})

export type CreateTaskSchemaType = z.infer<typeof CreateTaskSchema>

export const UpdateTaskSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
  
  videoUrl: z.any().optional().nullable(),
  imageUrl: z.any().optional().nullable(),

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
  emojiId: z.string().min(1, "Selecione um ícone").optional(), // ID do Emoji
  counterId: z.string().optional(),
})

export type UpdateTaskSchemaType = z.infer<typeof UpdateTaskSchema>

export const FastCreateSchema = z.object({
  targetEmail: z.string().email(),
  tasks: z.array(z.object({
    name: z.string().min(3).max(100),
    description: z.string().max(255).optional(),
    emoji: z.string().max(10).optional(),
    color: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
    goal: z.object({
      name: z.string().min(2),
      emoji: z.string().max(10).optional()
    }).optional(),
    category: z.object({
      name: z.string().min(2),
      emoji: z.string().max(10).optional(),
      color: z.string().regex(/^#([0-9A-Fa-f]{6})$/).optional(),
    }).optional(),
    counter: z.object({
      label: z.string().min(2).max(20),
      valueNumber: z.number().min(1),
      unit: z.string().optional()
    }),
    metrics: z.array(z.object({
      emoji: z.string().max(20).optional(),
      field: z.string().max(20).optional(),
      unit: z.string().optional(),
      fieldType: z.enum(["NUMERIC", "STRING", "FLOAT"]).default("NUMERIC")
    })).min(1)
  }))
})

export type FastCreatechemaType = z.infer<typeof FastCreateSchema>
