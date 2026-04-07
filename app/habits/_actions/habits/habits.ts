'use server'

import { redirect } from "next/navigation"

import { currentUser } from '@clerk/nextjs/server'

import { prisma } from "@/lib/prisma"

import {
  CreateHabitSchema,
  type CreateHabitSchemaType
} from "@/lib/schema/habit"

export async function CreateHabit(form: CreateHabitSchemaType) {
  try {
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
      limitCounter,
      goals,
      categories,
      custom_field,
      duration
    } = parsedBody.data
  
    const date = startDate ? new Date(startDate) : new Date()
    const newStartdate = new Date(date)
      newStartdate.setHours(0,0,0,0)
    const newEnddate = 
      endDate ? new Date(endDate) : null
    if(newEnddate) {
      newEnddate.setHours(0,0,0,0)
    }

    const newHabit = await prisma.habit.create({
      data: {
        userId: userDb.id,
        name,
        emoji,
        startDate: newStartdate,
        endDate: newEnddate,
        reminder,
        customField: custom_field,
        duration,
        frequency, // Json
        color,
        limitCounter: Number(limitCounter) || 1,
        ...(goals  && {goals: {
          connect: {
            id: goals
          }
        }}),
        ...(categories  && {categories: {
          connect: {
            id: categories
          }
        }}),
        clock
      },
      include: {
        completions: true,
      },
    })

    // console.log(newHabit)

    return newHabit
  } catch (error) {
    if(error instanceof Error) {
      console.log(error.message)
      throw new Error(error.name, { cause: error.message })
    }   
  }
}

export async function DeleteHabit(habitId: string) {
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

  if (!habitId) {
    throw new Error("habit Id is not set")
  }

  const modifiedAt = new Date()

  return await prisma.$transaction([
    prisma.habitSchedule.updateMany({
      where: { habitId: habitId },
      data: {
        status: 'ARCHIVED',
        // deletedAt: modifiedAt.toISOString().split("T")[0],
        updatedAt:  modifiedAt,
      }
    }),
    prisma.habit.update({
      where: { id: habitId },
      data: {
        status: 'ARCHIVED',
        deletedAt: modifiedAt,
        updatedAt:  modifiedAt,
      }
    })
  ])
}