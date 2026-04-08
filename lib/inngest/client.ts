import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "wisey-app",
  ai: {
    gemini: {
      apikey: process.env.GEMINI_API_KEY!
    }
  },
  // Força o modo dev se não estivermos em produção
  isDev: process.env.NODE_ENV !== "production",
})
