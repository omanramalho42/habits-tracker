'use server'

import { redirect } from "next/navigation"

import { currentUser } from "@clerk/nextjs/server"

import { prisma } from "@/lib/prisma"

import { CreateCategorieSchema, CreateCategorieSchemaType } from "@/lib/schema/categorie"
import { Prisma } from "@prisma/client"

export async function CreateCategorie(form: CreateCategorieSchemaType) {
  try {
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
  } catch (error: any) {
    // Tratamento unificado de P2002 (Unique Constraint)
    if (error?.code === "P2002" || error?.message?.includes("Unique constraint failed")) {
       throw new Error("Você já possui uma categoria com esse nome.")
    }

    throw new Error("Algo deu errado ao criar a categoria.")
  }
}