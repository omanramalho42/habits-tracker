import axios from "axios"

import type { Task } from '@prisma/client'
import { CreateTaskSchemaType, UpdateTaskSchemaType } from "@/lib/schema/task"

export const fetchTasks = async (): Promise<Task[]> => {
  const { data: goals } = await axios.get(
    `/api/task`
  )

  return goals
}

/* =======================
   CREATE
======================= */

export const createTask = async (
  data: CreateTaskSchemaType
) => {
  const response = await axios.post(
    `/api/task`,
    data
  )

  return response.data
}


/* =======================
   UPDATE
======================= */

export const updateTask = async (
  data: UpdateTaskSchemaType
) => {
  const response = await axios.patch(
    `/api/task/${data.id}`,
    data
  )

  return response.data
}

/* =======================
   DELETE
======================= */

export const deleteTask = async (
  habitId: string
) => {
  const response = await axios.delete(
    `/api/task/${habitId}`
  )

  return response.data
}