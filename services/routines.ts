import type {
  CreateRoutineSchemaType,
  UpdateRoutineSchemaType
} from "@/lib/schema/routine"

import type {
  Categories,
  Habit,
  HabitCompletion,
  HabitSchedule,
  Routine,
  Task,
  TaskCompletion,
  TaskSchedule
} from "@prisma/client"

import axios from "axios"

export const fetchRoutines = async (
  selectedDate?: string
): Promise<(Routine & {
  habitSchedules?: (HabitSchedule & {
    habit: Habit & {
      completions: HabitCompletion[]
      categories: Categories[]
    }
  })[] } & {
  taskSchedules?: (TaskSchedule & {
    task: Task & {
      completions: TaskCompletion[]
      categories: Categories[]
    }
  })[]})[]> => {
  const { data: routines } = await axios.get(
    `/api/routines${selectedDate ? `?selectedDate=${selectedDate}` : ""}`
  )

  return routines
}

export const createRoutine = async (values: CreateRoutineSchemaType): Promise<Routine[]> => {
  const { data: routines } = await axios.post(
    `/api/routines`,
    {
      ...values,
      habits: values.habits?.map((h: any) => h.id ?? h),
      tasks: values.tasks?.map((t: any) => t.id ?? t)
    }
  )

  return routines
}

/* =======================
   UPDATE
======================= */

export const updateRoutine = async (
  values: UpdateRoutineSchemaType
): Promise<Routine> => {

  const { data: routines } = await axios.patch(
    `/api/routines/${values.id}`,
    {
      ...values,
      habits: values.habits?.map((h: any) => h.id ?? h),
      tasks: values.tasks?.map((t: any) => t.id ?? t)
    }
  )

  return routines
}

/* =======================
   DELETE
======================= */

export const deleteRoutine = async (
  routineId: string
) => {
  const response = await axios.delete(
    `/api/routines/${routineId}`
  )

  return response.data
}

