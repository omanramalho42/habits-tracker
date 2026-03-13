import axios from "axios"

export const fetchNews = async (): Promise<any> => {
  const { data: news } = await axios.get(
    `/api/news`
  )

  return news
}
