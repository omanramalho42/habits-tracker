import { z } from "zod"

export const createFeedbackSchema = z.object({
  type: z.enum([
    "BUG",
    "SUGGESTION",
    "IMPROVEMENT",
    "OTHER"
  ]),
  title: z
    .string()
    .min(3, "Título obrigatório"),
  description: z
    .string()
    .min(10, "Descreva melhor o feedback"),
  rating: z
    .number()
    .min(0)
    .max(5)
    .optional(),
  page: z
    .string()
    .optional(),
  files: z
    .any()
    .optional().default([]),
})

export type CreateFeedbackSchemaType = z.infer<typeof createFeedbackSchema>