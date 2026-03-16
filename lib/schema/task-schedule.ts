import { z } from "zod"

export const updateTaskScheduleSchema = z.object({
  id: z.string(),
  clock: z.string().optional(),
  duration: z.string().optional(),
  task: z.any(),
})

export type UpdateTaskScheduleSchemaType = z.infer<typeof updateTaskScheduleSchema>
