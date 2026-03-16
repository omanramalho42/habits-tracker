import type { Task, Routine } from "@prisma/client"
import axios from "axios"

export const updateTaskSchedule = async (
  values: { id: string; clock?: string; duration?: string; task: Task }
): Promise<Routine> => {
  const { data: routines } = await axios.patch(
    `/api/task-schedule/${values.task.id}`,
    values
  )

  return routines
}

export const removeTaskSchedule = async (
  routineId: string,
  taskScheduleId: string
) => {
  const response = await axios.put(
    `/api/routines/${routineId}`, {
      taskScheduleId
    }
  )

  return response.data
}