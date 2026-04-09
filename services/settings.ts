import axios from "axios"

import type { User, UserSettings } from "@prisma/client"

export const fetchUserSettings = async (): Promise<UserSettings & { user: User }> => {
  const { data: settings } = await axios.get(
    `/api/settings`
  )

  return settings
}
