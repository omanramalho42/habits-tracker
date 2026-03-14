'use server'

import { redirect } from "next/navigation"

import { currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { CreateCategorieSchema, CreateCategorieSchemaType } from "@/lib/schema/categorie"

export async function CreateCategorie(form: CreateCategorieSchemaType) {
  const parsedBody = CreateCategorieSchema.safeParse(form)

  if(!parsedBody.success) {
    throw new Error(parsedBody.error.message)
  }
  
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
    description,
    emoji,
  } = parsedBody.data

  return await prisma.categories.create({
    data: {
      name,
      userId: userDb.id,
      description: description || "",
      emoji: emoji || "",
    }
  })
}