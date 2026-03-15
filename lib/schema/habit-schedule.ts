import { z } from "zod"

export const updateHabitScheduleSchema = z.object({
  id: z.string(),
  clock: z.string(),
  duration: z.string(),
  habit: z.any(),
})

export type UpdateHabitScheduleSchemaType = z.infer<typeof updateHabitScheduleSchema>
