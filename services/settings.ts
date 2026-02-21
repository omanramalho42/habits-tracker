import { UserSettings } from "@prisma/client"
import axios from "axios"

export const fetchUserSettings = async (): Promise<UserSettings> => {
  const { data: settings } = await axios.get(
    `/api/settings`
  )

  return settings
}
