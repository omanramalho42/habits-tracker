import { z } from "zod"

export const GoalSchema = z.object({
  // id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
  // createdAt: z.coerce.date(),
  // updatedAt: z.coerce.date().optional(),
  // userId: z.string().optional(),
})

export type CreateGoalSchemaType = z.infer<typeof GoalSchema>