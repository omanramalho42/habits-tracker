// lib/validations/voice.ts
import { z } from "zod"

export const HabitVoiceSchema = z.object({
  name: z.string({ required_error: "Nome do hábito é obrigatório" }).min(2),
  emoji: z.string().optional(),
})

export const TaskVoiceSchema = z.object({
  name: z.string({ required_error: "Nome da tarefa é obrigatório" }).min(2),
  description: z.string().optional(),
})

// Mapeamento para facilitar o acesso dinâmico
export const voiceSchemas = {
  habit: HabitVoiceSchema,
  task: TaskVoiceSchema,
} as const