import z from "zod"

export const createCounterStepSchema = z.object({
  date: z.coerce.date(),
  currentStep: z.coerce.number(),
  limit: z.coerce.number(),
  completionId: z.string(),
  counterId: z.string(),
  createdAt: z.coerce.date().default(new Date).optional()
})

export type CreateCounterStepSchemaType = z.infer<typeof createCounterStepSchema>

export const updateCounterStepSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  currentStep: z.coerce.number(),
  limit: z.coerce.number(),
  completionId: z.string(),
  counterId: z.string(),
  updatedAt: z.coerce.date().default(new Date()).optional()
})

export type UpdateCounterStepSchemaType = z.infer<typeof updateCounterStepSchema>