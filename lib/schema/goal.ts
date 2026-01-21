import { z } from "zod"

export const GoalSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional()
})

export type CreateGoalSchemaType = z.infer<typeof GoalSchema>