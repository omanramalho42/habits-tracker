"use client"

import React, { useEffect, useState } from 'react'

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from 'axios'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

import { HabitCard } from '@/components/habit-card'
import {
  CreateHabitDialog,
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import { Plus } from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'

interface ActiveCardHabitsProps {
  habits: HabitWithStats[]
  selectedDate: Date
}

const ActiveCardHabits:React.FC<ActiveCardHabitsProps> = ({
  habits,
  selectedDate
}) => {
  const queryClient = useQueryClient()  
  console.log(habits, "habits")

  const completedToday = habits.reduce((total, habit) => {
    const completed = habit.completions?.some(
      (c) =>
        new Date(c.completedDate).toISOString().split("T")[0] === 
        new Date(selectedDate).toISOString().split("T")[0]
    )

    return completed ? total + 1 : total
  }, 0)

  const handleHabitError = (message: string) => {
    toast.error(message)
  }
  
  const handleToggleHabit = (habitId: string, date: Date) => {
    toast.loading("Alterando status do hábito...", {
      id: "toggle-habit",
    })

    mutate({
      habitId,
      date: date.toISOString(),
    })
  }
  
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      habitId,
      date,
    }: {
      habitId: string
      date: string
    }) => {
      const response = await axios.post(
        `/api/habits/${habitId}/toggle`,
        { date: date }
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
          c => 
            new Date(c.completedDate)
            .toISOString()
            .split("T")[0] === 
            new Date(date)
            .toISOString()
            .split("T")[0]
        )

    const counter = 
      habit?.completions.find(
        (c) => 
          new Date(c.completedDate).toISOString().split("T")[0] === 
          new Date(selectedDate).toISOString().split("T")[0]
      )?.counter || 0

      const limit = (habit?.limitCounter || 1) - 1

      if(counter < limit) {
        toast.success("Hábito marcado com sucesso!", {
          id: "toggle-habit",
        })
      }

      if(counter > limit) {
        toast.success("Hábito desmarcado com sucesso!", {
          id: "toggle-habit",
        })
      }

      if (counter === limit) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })

        toast.success("Hábito concluído com sucesso!", {
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

  return (
    <div className='flex flex-col space-y-6'>

      {/* PROGRESS CARD */}
      {completedToday > 0 && habits.length > 0 && (
        <div className="bg-linear-to-r from-primary/10 to-blue-600/10 border border-primary/20 rounded-xl p-8 text-center shadow-sm">
          <p className="text-4xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            {completedToday}/{habits.length}
          </p>
          <p className="text-sm text-muted-foreground font-medium">
            Hábitos completos hoje
          </p>
        </div>
      )}

      {/* LIST HABITS (ARRAY EMPTY) */}
      {habits.length === 0 ? (
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
          {[...habits]
            .map((habit) => (
              <HabitCard
                loading={isPending}
                key={habit.id}
                habit={habit}
                onToggle={(id) => handleToggleHabit(id, selectedDate)}
                selectedDate={selectedDate}
                onError={handleHabitError}
              />
            ))}
        </div>
      )}
    </div>
  )
}

export default ActiveCardHabits