import axios from "axios"

import type { Task } from '@prisma/client'

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: goals } = await axios.get(
    `/api/task`
  )

  return goals
}