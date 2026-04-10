import axios from "axios"

import type { User, UserSettings, UserUsage } from "@prisma/client"

export const fetchUserSettings = async (): Promise<UserSettings & { user: User & { UserUsage: UserUsage }}> => {
  const { data: settings } = await axios.get(
    `/api/settings`
  )

  return settings
}
