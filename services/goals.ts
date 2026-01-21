import { Goals } from "@prisma/client"
import axios from "axios"

export const fetchGoals = async (): Promise<Goals[]> => {
  const { data: goals } = await axios.get(
    `/api/goals`
  )

  return goals
}