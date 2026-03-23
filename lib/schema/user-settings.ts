import { z } from "zod"

export const createUserSettingSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email("O email deve seguir o formato correto"),
  allow_notifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  isTravelling: z.boolean().default(false),
  theme: z.enum(["light", "dark"]).optional(),
  avatarUrl: z.any().optional(),
  bannerUrl: z.any().optional(),
})

export type CreateUserSettingSchemaType = z.infer<typeof createUserSettingSchema>

export const updateUserSettingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email("O email deve seguir o formato correto"),
  allow_notifications: z.boolean().default(false),
  emailNotifications: z.boolean().default(false),
  smsNotifications: z.boolean().default(false),
  isTravelling: z.boolean().default(false),
  theme: z.enum(["light", "dark"]).optional(),
  avatarUrl: z.any().optional(),
  bannerUrl: z.any().optional(),
})

export type UpdateUserSettingSchemaType = z.infer<typeof updateUserSettingSchema>
