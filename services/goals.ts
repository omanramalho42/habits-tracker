import axios from "axios"

import type { Goals } from '@prisma/client'

export type GoalsDTO = Omit<Goals, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string | null
}

export const fetchGoals = async (): Promise<GoalsDTO[]> => {
  const { data: goals } = await axios.get(
    `/api/goals`
  )

  return goals
}