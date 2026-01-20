import { z } from "zod"

export const CreateHabitSchema = z.object({
  name: z.string(),
  emoji: z.string().default("🌍"),
  goal: z.string().optional().default(""),
  motivation: z.string().optional().default(""),
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
