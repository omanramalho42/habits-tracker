import type { Habit, Routine } from "@prisma/client"
import axios from "axios"

export const removeHabitSchedule = async (
  routineId: string,
  habitScheduleId: string
) => {
  const response = await axios.put(
    `/api/routines/${routineId}`, {
      habitScheduleId
    }
  )

  return response.data
}
export const updateHabitSchedule = async (
  values: { id: string; clock?: string; duration?: string; habit: Habit }
): Promise<Routine> => {
  console.log(values, "values")

  const { data: routines } = await axios.patch(
    `/api/habit-schedule/${values.habit.id}`,
    values
  )

  return routines
}