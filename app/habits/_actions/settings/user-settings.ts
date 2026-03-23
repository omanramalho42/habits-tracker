"use server"

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from "@/lib/prisma"

import {
  UpdateUserSettingSchemaType, 
  updateUserSettingSchema
} from "@/lib/schema/user-settings"
import { uploadToCloudinary } from "../annotations/annotations"

export async function udapteUserSettings(form: UpdateUserSettingSchemaType) {
  const parsedBody =  updateUserSettingSchema.safeParse(form)

  if (!parsedBody.success) throw new Error(parsedBody.error.message)

  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // VERIFICAR SE O USUARIO EXISTE NO BD
  const userDb = await prisma.user.findFirst({
    where: {
      clerkUserId: user.id,
    },
  })

  if (!userDb) {
    throw new Error("User not found")
  }

  const {
    name,
    email,
    phone,
    avatarUrl,
    bannerUrl,
    theme,
    emailNotifications,
    smsNotifications,
    allow_notifications,
    isTravelling
  } = parsedBody.data

  console.log(parsedBody.data, "data")

  if(!parsedBody.success) {
    throw new Error("Error parsing data files")
  }

  const uploadedFiles = []
  let avatarImageUrl = null

  for (const file of bannerUrl) {
    const uploaded = await uploadToCloudinary(file)

    if (uploaded) {
      uploadedFiles.push({
        url: uploaded.url,
        type: uploaded.resourceType, // image | video | raw
      })
    }
  }

  if (avatarUrl instanceof File) {
    const uploaded = await uploadToCloudinary(avatarUrl)
    avatarImageUrl = uploaded?.url
  }

  const existUserSettings = await prisma.userSettings.findUnique({
    where: {
      userId: userDb.id
    }
  })

  console.log(avatarImageUrl, "avatar image")

  try {
    if(!existUserSettings) {
      const updated = await prisma.userSettings.create({
        data: {
          name,
          phone,
          email: email,
          ...(avatarImageUrl && { avatarUrl: avatarImageUrl }),
          bannerUrl: uploadedFiles[0]?.url || "",
          notificationsEnabled: allow_notifications,
          emailNotifications,
          smsNotifications,
          userId: userDb.id,
        }
      })

      return updated
    } else {
      const updated = await prisma.userSettings.update({
        where: {
          userId: existUserSettings.userId
        },
        data: {
          name,
          phone,
          email,
          notificationsEnabled: allow_notifications,
          ...(avatarImageUrl && { avatarUrl: avatarImageUrl }),
          bannerUrl: uploadedFiles[0]?.url || "",
          emailNotifications,
          smsNotifications,
          updatedAt: new Date()
        }
      })

      return updated
    }
  } catch (error) {
    if(error instanceof Error) {
      console.log(error.message)
    }
  }
}

export async function createUserSettings(form: UpdateUserSettingSchemaType) {
  const parsedBody =  updateUserSettingSchema.safeParse(form)

  if (!parsedBody.success) throw new Error(parsedBody.error.message)

  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')
  }

  // VERIFICAR SE O USUARIO EXISTE NO BD
  const userDb = await prisma.user.findFirst({
    where: {
      clerkUserId: user.id,
    },
  })

  if (!userDb) {
    throw new Error("User not found")
  }

  const {
    name,
    email,
    phone,
    avatarUrl,
    bannerUrl,
    theme,
    emailNotifications,
    smsNotifications,
    allow_notifications,
    isTravelling
  } = parsedBody.data

  console.log(parsedBody.data, "data")

  if(!parsedBody.success) {
    throw new Error("Error parsing data files")
  }

  const uploadedFiles = []
  let avatarImageUrl = null

  for (const file of bannerUrl) {
    const uploaded = await uploadToCloudinary(file)

    if (uploaded) {
      uploadedFiles.push({
        url: uploaded.url,
        type: uploaded.resourceType, // image | video | raw
      })
    }
  }

  if (avatarUrl instanceof File) {
    const uploaded = await uploadToCloudinary(avatarUrl)
    avatarImageUrl = uploaded?.url
  }

  const existUserSettings = await prisma.userSettings.findUnique({
    where: {
      userId: userDb.id
    }
  })

  try {
    if(!existUserSettings) {
      const updated = await prisma.userSettings.create({
        data: {
          name,
          phone,
          theme,
          email: email,
          ...(avatarImageUrl && { avatarUrl: avatarImageUrl }),
          bannerUrl: uploadedFiles[0]?.url || "",
          notificationsEnabled: allow_notifications,
          emailNotifications,
          smsNotifications,
          userId: userDb.id,
        }
      })

      return updated
    } else {
      const updated = await prisma.userSettings.update({
        where: {
          userId: existUserSettings.userId
        },
        data: {
          name,
          phone,
          email,
          theme,
          notificationsEnabled: allow_notifications,
          ...(avatarImageUrl && { avatarUrl: avatarImageUrl }),
          bannerUrl: uploadedFiles[0]?.url || "",
          emailNotifications,
          smsNotifications,
          updatedAt: new Date()
        }
      })

      return updated
    }
  } catch (error) {
    if(error instanceof Error) {
      console.log(error.message)
    }
  }
}