'use server'

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import {
  CreateHabitSchema,
  CreateHabitSchemaType
} from "@/lib/schema/habit"

import { prisma } from "@/lib/prisma"

export async function CreateHabit(form: CreateHabitSchemaType) {
  const parsedBody =  CreateHabitSchema.safeParse(form)

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

  // FIND EXISTS FOLLOWING CATEGORY NAME
  if(userDb) {
    const {
      color,
      emoji,
      frequency,
      goal,
      motivation,
      name,
      reminder,
      startDate,
      endDate
    } = parsedBody.data

    return await prisma.$transaction([
      prisma.habit.create({
        data: {
        userId: userDb.id,
        name,
        emoji,
        goal,
        motivation,
        startDate: (new Date(startDate)),
        endDate: endDate ? new Date(endDate) : null,
        reminder,
        frequency, // Json
        color,
        }, include: {
          completions: true
        }
      }),
    ])
  }
}