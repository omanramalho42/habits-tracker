import { z } from "zod"

export const CreateMetricSchema = z.object({
  id: z.string().optional(),
  index: z.string().optional(),
  isComplete: z.boolean().default(false),
  limit: z.coerce.number()
    .min(1, "O valor minimo é 1"),
  field: 
    z.string()
    .min(1, "O valor minimo de caracateres é 1"),
  value: 
    z.string()
    .optional(),
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

export const UpdateMetricSchema = z.object({
  id: z.string().optional(),
  index: z.string().optional(),
  isComplete: z.boolean().default(false),
  limit: z.coerce.number()
    .min(1, "O valor minimo é 1"),
  field: 
    z.string()
    .min(1, "O valor minimo de caracateres é 1"),
  value: 
    z.string()
    .min(1, "Ovalor minimo de caracteres é 1")
    .optional(),
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

export const putMetricSchema = z.object({
  id: z.string().optional(),
  index: z.string(),
  isComplete: z.boolean().default(false),
  completionId: z.string().optional(),
  counterId: z.string().optional(),
  limit: z.coerce.number()
    .min(1, "O valor minimo é 1"),
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
}).array()

export type PutMetricSchemaType = z.infer<typeof putMetricSchema>