import { z } from "zod"

export const CreateGoalSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
})

export const UpdateGoalSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
})

export type UpdateGoalSchemaType = z.infer<typeof UpdateGoalSchema>

export type CreateGoalSchemaType = z.infer<typeof CreateGoalSchema>