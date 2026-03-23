import { z } from "zod"

export const createUserSettingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email("O email deve seguir o formato correto"),
  allow_notifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  isTravelling: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).optional(),
  avatarUrl: z.any().optional().default([]),
  bannerUrl: z.any().optional().default([]),
})

export type CreateUserSettingSchemaType = z.infer<typeof createUserSettingSchema>

export const updateUserSettingSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().email("O email deve seguir o formato correto").optional(),
  allow_notifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  isTravelling: z.boolean().default(false),
  theme: z.enum(["light", "dark", "system"]).optional(),
  avatarUrl: z.any().optional().default([]),
  bannerUrl: z.any().optional().default([]),
})

export type UpdateUserSettingSchemaType = z.infer<typeof updateUserSettingSchema>
