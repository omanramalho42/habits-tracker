import { CreateRoutineSchemaType, UpdateRoutineSchemaType } from "@/lib/schema/routine"
import { HabitWithStats } from "@/lib/types"
import { Habit, HabitSchedule, Routine } from "@prisma/client"
import axios from "axios"

export const fetchRoutines = async (
  selectedDate?: string
): Promise<(Routine & { habitSchedules?: (HabitSchedule & { habit?: Habit })[] })[]> => {
  const { data: routines } = await axios.get(
    `/api/routines${selectedDate ? `?selectedDate=${selectedDate}` : ""}`
  )

  return routines
}

export const createRoutine = async (values: CreateRoutineSchemaType): Promise<Routine[]> => {
  const { data: routines } = await axios.post(
    `/api/routines`,
    {...values, habits: values.habits?.map((h: any) => h.id ?? h)}
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
    {...values, habits: values.habits?.map((h: any) => h.id ?? h)}
  )

  return routines
}

/* =======================
   DELETE
======================= */

export const removeHabitFromRoutine = async (
  routineId: string,
  habitScheduleId: string
) => {
  const response = await axios.put(
    `/api/routines/${routineId}`, {
      habitScheduleId
    }
  )

  return response.data
}

export const deleteRoutine = async (
  routineId: string
) => {
  const response = await axios.delete(
    `/api/routines/${routineId}`
  )

  return response.data
}

export const updateRoutineHabitSchedule = async (
  values: { id: string; clock: string; duration: string; habit: Habit }
): Promise<Routine> => {
  console.log(values, "values")

  const { data: routines } = await axios.patch(
    `/api/habit-schedule/${values.habit.id}`,
    values
  )

  return routines
}

