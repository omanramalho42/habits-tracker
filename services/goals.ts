import axios from "axios"

import type { CheckPoint, Goals, Habit, Task } from '@prisma/client'

export type GoalsDTO = Goals & {
  habits?: Habit[]
  tasks?: Task[]
  checkpoints?: CheckPoint[]
}

export const fetchGoals = async (): Promise<GoalsDTO[]> => {
  const { data } = await axios.get(`/api/goals`)
  return data
}