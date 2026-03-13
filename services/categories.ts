import axios from "axios"

import type { Categories, Habit } from '@prisma/client'

export type CategoriesDTO = Categories & {
  habits?: Habit[]
}

export const fetchCategories = async (): Promise<CategoriesDTO[]> => {
  const { data: goals } = await axios.get(
    `/api/categories`
  )

  return goals
}