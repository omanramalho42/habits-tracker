"use client"

import React, { useEffect, useState } from 'react'

import axios from 'axios'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { HabitDetailDialog } from '@/components/habit-detail-dialog'
import {
  CreateHabitDialog,
  HabitSchemaType
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'
import { HabitCard } from '@/components/habit-card'

import { Plus } from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'
import { isHabitActiveOnDate } from '@/lib/habit-utils'

interface ActiveCardHabitsProps {
  habits: HabitWithStats[]
  selectedDate: Date
  onSuccessCallback?: (data: HabitWithStats[]) => void
}

const ActiveCardHabits:React.FC<ActiveCardHabitsProps> = ({
  habits,
  selectedDate,
  onSuccessCallback
}) => {
  console.log(habits, "habits")
  const [loading, setLoading] =
    useState<boolean>(false)
  const [detailHabit, setDetailHabit] =
    useState<HabitWithStats | null>(null)
  
  useEffect(() => {
    updateActiveHabitsForSelectedDate(habits)
  }, [selectedDate, habits])

  const [completedToday, setCompletedToday] = 
    useState(0)
  const [activeHabitsForSelectedDate, setActiveHabitsForSelectedDate] = 
    useState<HabitWithStats[]>([])

  const updateActiveHabitsForSelectedDate = (habits: HabitWithStats[]) => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      return
    }
    // console.log(habits, "Habits")
    const selectedDateString =
      selectedDate.toISOString().split("T")[0]
    const activeHabits =
      habits.filter((habit) => 
        isHabitActiveOnDate(habit, selectedDate)
      )
    // console.log(selectedDateString, 'selected date');
    const completedCount = activeHabits.filter((habit) =>
      habit.completions.some(
        (completion) => 
          completion.completed_date === selectedDateString
      ),
    ).length
    // console.log(activeHabits, "active habits")
    setActiveHabitsForSelectedDate(activeHabits)
    setCompletedToday(completedCount)
  }

  const fetchHabits: () => Promise<void> = async () => {
    try {
      const response = await axios.get("/api/habits")

      const habitsWithStats: HabitWithStats[] = await Promise.all(
        response.data.map(async (habit: any) => {
          const statsResponse = await axios.get(
            `/api/habits/${habit.id}/stats`
          )
          return await statsResponse.data
        }),
      )
      onSuccessCallback?.(habitsWithStats)

    } catch (error) {
      console.error("Error fetching habits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleHabitError = (message: string) => {
    toast.error(message)
  }

  const handleToggleHabit = async (habitId: string, date?: string) => {
    const toastId =
      toast.loading(
        'Alterando status do hábito...',
        { id: 'toggle-habit' }
      )

    try {
      setLoading(true)

      const habit = habits.find((h) => h.id === habitId)
      const dateStr = date || selectedDate?.toISOString().split("T")[0]

      const isCompleting = 
        !habit?.completions?.some(
          (c) => 
            c?.completed_date === dateStr
        )
      
      const response = 
        await axios.post(
          `/api/habits/${habitId}/toggle`,
          JSON.stringify({ date: dateStr })
        )

      if (response.data) {
        if (detailHabit && detailHabit.id === habitId) {
          const statsResponse = 
            await axios.get(
              `/api/habits/${habitId}/stats`
            )
            console.log(statsResponse, "stats response")
          const updatedHabit: HabitWithStats[] = statsResponse.data

          onSuccessCallback?.(updatedHabit)
        }

        await fetchHabits()
        if (isCompleting) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
          })
          toast.success(
            "Hábito concluído com sucesso!",
            { id: toastId }
          )
        } else {
          toast.success(
            "Hábito desmarcado com sucesso!",
            { id: toastId }
          )
        }
      }
      setLoading(false)
    } catch (error) {
      if(error instanceof Error) {
        console.log(error.message, "error")
        toast.error(
          error.message,
          { id: toastId }
        )
      }
    }
  }

  const handleViewDetail = async (habitId: string) => {
    const statsResponse =
      await axios.get(`/api/habits/${habitId}/stats`)

    const habitWithStats =
      await statsResponse.data

    setDetailHabit(habitWithStats)
  }

  const handleCreateHabit = async (data: HabitSchemaType) => {
    console.log(data, 'data');
    try {
      const response = 
        await axios.post(
          '/api/habits',
          data
        )
    
      if(response.data) {
        return await fetchHabits()
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message, 'error')
      }
    }
  }

  const selectedDateString = selectedDate.toISOString().split("T")[0]

  return (
    <div>
      {completedToday > 0 && activeHabitsForSelectedDate.length > 0 && (
        <div className="bg-linear-to-r from-primary/10 to-blue-600/10 border border-primary/20 rounded-2xl p-6 text-center mb-6 shadow-sm">
          <p className="text-4xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            {completedToday}/{activeHabitsForSelectedDate.length}
          </p>
          <p className="text-sm text-muted-foreground font-medium">Hábitos completos hoje</p>
        </div>
      )}
      {/* LIST HABITS (ARRAY EMPTY) */}
      {activeHabitsForSelectedDate.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🎯</div>
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            {habits.length === 0 ? "Comece sua jornada" : "Nenhum hábito encontrado para este dia"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {habits.length === 0
              ? "Crie seu primeiro hábito e comece a construir melhor a sua rotina"
              : "Nenhum hábito agendado para esta data. Tente selecionar um dia diferente ou crie um novo hábito."}
          </p>
          <CreateHabitDialog
            onSuccessCallback={handleCreateHabit}
            trigger={
              <Button
                size="lg"
                className="bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {habits.length === 0 ? "Crie seu primeiro hábito" : "Criar novo hábito"}
              </Button>   
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {[...activeHabitsForSelectedDate]
            .map((habit) => (
              <HabitCard
                loading={loading}
                key={habit.id}
                habit={habit}
                onToggle={(id) => handleToggleHabit(id, selectedDateString)}
                onClick={() => handleViewDetail(habit.id)}
                selectedDate={selectedDate}
                onError={handleHabitError}
              />
            ))}
        </div>
      )}

      {/* VIEW HABIT DETAILS */}
      <HabitDetailDialog
        open={!!detailHabit}
        onOpenChange={(open) => !open && setDetailHabit(null)}
        habit={detailHabit}
      />
    </div>
  )
}

export default ActiveCardHabits