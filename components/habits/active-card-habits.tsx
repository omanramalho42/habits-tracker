"use client"

import React, { useEffect, useState } from 'react'

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from 'axios'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { HabitCard } from '@/components/habit-card'
import { HabitDetailDialog } from '@/components/habit-detail-dialog'
import {
  CreateHabitDialog,
  HabitSchemaType
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import { isHabitActiveOnDate } from '@/lib/habit-utils'

import { Plus } from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'


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
  const [loading, setLoading] =
  useState<boolean>(false)
  const [detailHabit, setDetailHabit] =
  useState<HabitWithStats | null>(null)
  
  const queryClient = useQueryClient()
  
  useEffect(() => {
    updateActiveHabitsForSelectedDate(habits)
  }, [selectedDate, habits])

  const [completedToday, setCompletedToday] = 
    useState(0)
  const [activeHabitsForSelectedDate, setActiveHabitsForSelectedDate] = 
    useState<HabitWithStats[]>([])

  const updateActiveHabitsForSelectedDate = (habits: HabitWithStats[]) => {
    setLoading(true)
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      return
    }
    console.log(habits, "habits")
    const activeHabits =
      habits.filter((habit) => 
        isHabitActiveOnDate(habit, selectedDate)
      )
    console.log(activeHabits, "active habits")
    // console.log(selectedDateString, 'selected date');
    const completedCount = activeHabits.filter((habit) =>
      habit?.completions?.some(
        (completion) => 
          completion.completedDate === selectedDate.toISOString().split("T")[0]
      ),
    ).length
    // console.log(activeHabits, "active habits")
    setActiveHabitsForSelectedDate(activeHabits)
    setCompletedToday(completedCount)
    setLoading(false)
  }
  console.log(activeHabitsForSelectedDate, "active habits")

  const handleHabitError = (message: string) => {
    toast.error(message)
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
        // return await fetchHabits()
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message, 'error')
      }
    }
  }

  const handleToggleHabit = (habitId: string, date: string) => {
    toast.loading("Alterando status do hábito...", {
      id: "toggle-habit",
    })

    mutate({
      habitId,
      date,
    })
  }
  
  const { mutate, isPending, data } = useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: {
      habitId: string
      date: string
    }) => {
      const response = await axios.post(
        `/api/habits/${habitId}/toggle`,
        { date }
      )
      return response.data
    },

    onSuccess: async (_, variables) => {
      // 🔁 refetch automático dos hábitos
      await queryClient.invalidateQueries({ queryKey: ["habits"] })

      const { habitId, date } = variables

      const habit = habits.find(h => h.id === habitId)

      const isCompleting =
        !habit?.completions?.some(
          c => c.completedDate.toLowerCase() === date.toLowerCase()
        )

      if (isCompleting) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })

        toast.success("Hábito concluído com sucesso!", {
          id: "toggle-habit",
        })
      } else {
        toast.success("Hábito desmarcado com sucesso!", {
          id: "toggle-habit",
        })
      }
    },

    onError: (error: any) => {
      toast.error(
        error?.message || "Erro ao alterar status do hábito",
        { id: "toggle-habit" }
      )
    },
  })

  console.log(data, "data");

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
                loading={isPending || loading}
                key={habit.id}
                habit={habit}
                onToggle={(id) => handleToggleHabit(id, selectedDate.toISOString().split("T")[0])}
                onClick={() => handleViewDetail(habit.id)}
                selectedDate={selectedDate}
                onError={handleHabitError}
              />
            ))}
        </div>
      )}

      {/* VIEW HABIT DETAILS */}
      {/* <HabitDetailDialog
        open={!!detailHabit}
        onOpenChange={(open) => !open && setDetailHabit(null)}
        habit={detailHabit}
      /> */}
    </div>
  )
}

export default ActiveCardHabits