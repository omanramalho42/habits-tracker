import axios from "axios"

import type { Annotations } from '@prisma/client'

export const fetchAnnotations = async (): Promise<Annotations[]> => {
  const { data: goals } = await axios.get(
    `/api/annotations`
  )

  return goals
}