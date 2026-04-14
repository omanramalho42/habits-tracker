import { z } from "zod"

export const CreateCategorieSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  color: z.string().optional(),
  userId: z.string().optional(),
})

export type CreateCategorieSchemaType = z.infer<typeof CreateCategorieSchema>

export const UpdateCategorieSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  emoji: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).default("ACTIVE").optional(),
})

export type UpdateCategorieSchemaType = z.infer<typeof UpdateCategorieSchema>