import { z } from "zod"

export const CreateHabitSchema = z.object({
  name: z.string(),
  emoji: z.string().default("🌍"),
  goal: z.string().optional().default(""),
  motivation: z.string().optional().default(""),
  startDate: z.date(),
  endDate: z.date().optional().nullable(),
  reminder: z.boolean().optional().default(false),
  // z.enum(['M', 'T', 'W', 'TH', 'F', 'SA', 'S'])
  frequency: z.array(z.string()).default([]),
  color: z.string().optional().default("#3B82F6"),
})

export type CreateHabitSchemaType = z.infer<typeof CreateHabitSchema>
