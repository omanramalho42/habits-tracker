import axios from "axios"
import { HabitWithStats } from "@/lib/types"
import { UpdateHabitSchemaType } from "@/lib/schema/habit"

/* =======================
   FETCH
======================= */

export const fetchHabits = async (
  selectedDate?: string
): Promise<HabitWithStats[]> => {
  const { data: habits } = await axios.get(
    `/api/habits${selectedDate ? `?selectedDate=${selectedDate}` : ""}`
  )
  const habitsWithStats = await Promise.all(
    habits.map(async (habit: any) => {
      const { data: stats } = await axios.get(
        `/api/habits/${habit.id}/stats`
      )

      return {
        ...habit,
        ...stats,
      }
    })
  )

  return habitsWithStats
}


/* =======================
   UPDATE
======================= */

export const updateHabit = async (
  data: UpdateHabitSchemaType
) => {
  const response = await axios.patch(
    `/api/habits/${data.id}`,
    data
  )

  return response.data
}

/* =======================
   DELETE
======================= */

export const deleteHabit = async (
  habitId: string
) => {
  const response = await axios.delete(
    `/api/habits/${habitId}`
  )

  return response.data
}