import { z } from "zod"

export const chatSchema = z.object({
  message: z.string().min(1, "A mensagem não pode estar vazia"),
  assistantId: z.string().min(1, "Selecione um mentor"),
})

export type ChatSchema = z.infer<typeof chatSchema>