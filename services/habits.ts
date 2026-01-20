import axios from "axios"
import { HabitWithStats } from "@/lib/types"

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
        stats,
      }
    })
  )

  return habitsWithStats
}
