import { z } from "zod"

export const createRoutineSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date().optional()
  }),
  cron: z.string().optional(),
  frequency: z.array(z.string()).default([]),
  habits: z.array(z.string().min(1)).optional(),
  tasks: z.array(z.string().min(1)).optional()
})

export const updateRoutineSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  dateRange: z.object({
    from: z.coerce.date(),
    to: z.coerce.date().optional()
  }),
  cron: z.string().optional(),
  frequency: z.array(z.string()).default([]),
  habits: z.array(z.string().min(1)).optional(),
  tasks: z.array(z.string().min(1)).optional()
})

export type UpdateRoutineSchemaType = z.infer<typeof updateRoutineSchema>
export type CreateRoutineSchemaType = z.infer<typeof createRoutineSchema>