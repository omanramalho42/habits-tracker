import { HabitStatus, MetricType } from "@prisma/client"
import { z } from "zod"

export const CreateMetricSchema = z.object({
  step: z.string().optional(),
  limit: 
    z.coerce.string()
    .min(1, "O valor minimo é 1"),
  isComplete: z.boolean().default(false).optional(),
  field: 
    z.string()
    .min(1, "O valor minimo de caracateres é 1"),
  value: 
    z.string()
    .optional(),
  fieldType: z.string().optional(),
    // z.nativeEnum(MetricType)
    // .default(MetricType.NUMERIC)
    // .optional(),
  status: z.nativeEnum(HabitStatus)
    .default(HabitStatus.ACTIVE)
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
  step: z.string().optional(),
  isComplete: z.boolean().default(false),
  limit: z.coerce.string()
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

export const putMetricSchema = z.object({
  id: 
    z.string()
    .optional(),
  completionId: 
    z.string()
    .optional(),
  counterId: 
    z.string()
    .optional(),
  limit:
    z.coerce.number()
    .min(1, "O valor minimo é 1"),
  field: 
    z.string()
    .min(1, "O valor minimo de caracateres é 1"),
  fieldType: 
    z.string()
    .optional(),
  unit: 
    z.string()
    .optional(),
  emoji: 
    z.string()
    .optional(),
  step:
    z.string(),
  value: 
    z.string()
    .min(1, "O valor minimo de caracteres é 1"),
  isComplete: 
    z.boolean()
    .default(false),
}).array()

export type PutMetricSchemaType = z.infer<typeof putMetricSchema>