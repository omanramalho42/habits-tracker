'use server'

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from "@/lib/prisma"

import {
  CreateHabitSchema,
  type CreateHabitSchemaType
} from "@/lib/schema/habit"


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

  if (!userDb) {
    throw new Error("User not found")
  }

  const {
    color,
    emoji,
    frequency,
    name,
    reminder,
    startDate,
    endDate,
    clock,
    counter,
    goal
  } = parsedBody.data

  return await prisma.habit.create({
    data: {
      userId: userDb.id,
      name,
      emoji,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      reminder,
      frequency, // Json
      color,
      counter: Number(counter),
      goals: {
        connect: {
          id: goal
        }
      },
      clock
    },
    include: {
      completions: true,
    },
  })
}