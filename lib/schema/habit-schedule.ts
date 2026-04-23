import { z } from "zod"

export const updateHabitScheduleSchema = z.object({
  id: z.string(),
  clock: z.string().optional(),
  duration: z.string().optional(),
  habit: z.any(),
  alarms: z.array(z.object({
    id: z.string().optional(),
    triggerTime: z.string(),
    message: z.string().optional(),
  })).optional(),
})

export type UpdateHabitScheduleSchemaType = z.infer<typeof updateHabitScheduleSchema>