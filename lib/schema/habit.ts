import { z } from "zod"

export const CreateHabitSchema = z.object({
  name: z.string(),
  emoji: z.string().optional(),
  goal: z.string().optional(),
  clock: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
  duration: z.string().optional(),
  limitCounter: z.coerce.number()
    .min(1, "O valor minimo a ser selecionado é igual a 1")
    .max(10, "O valor máximo a ser selecionado é igual a 10")
    .default(1)
    .optional(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.date().nullable()
  ).optional(),
  reminder: z.boolean().optional().default(false),
  // z.enum(['M', 'T', 'W', 'TH', 'F', 'SA', 'S'])
  frequency: z.array(z.string()).default([]),
  color: z.string().optional().default("#3B82F6"),
})

export type CreateHabitSchemaType = z.infer<typeof CreateHabitSchema>

export const UpdateHabitSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  emoji: z.string().optional(),
  goal: z.string().optional(),
  clock: z.string().optional(),
  custom_field: z.string().max(12, "O maximo de caracteres permitidos é 12").optional(),
  duration: z.string().optional(),
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
  // status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
  startDate: z.coerce.date(),
  endDate: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.date().nullable()
  ).optional(),
  reminder: z.boolean().optional().default(false),
  frequency: z.array(z.string()).default([]),
  color: z.string().optional().default("#3B82F6"),
  updatedAt: z.coerce.date().optional(),
})

export type UpdateHabitSchemaType = z.infer<typeof UpdateHabitSchema>