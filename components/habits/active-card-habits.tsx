"use client"

import React, { useEffect, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"
import { toast } from "sonner"
import confetti from "canvas-confetti"

import { HabitCard } from "@/components/habit-card"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

import { Button } from "@/components/ui/button"

import { GripVertical, Plus } from "lucide-react"

import type { HabitWithStats } from "@/lib/types"

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"
import { DndContext } from "@dnd-kit/core"

interface ActiveCardHabitsProps {
  habits: HabitWithStats[]
  selectedDate: Date
}

const ActiveCardHabits: React.FC<ActiveCardHabitsProps> = ({
  habits,
  selectedDate,
}) => {
  const queryClient = useQueryClient()

  const [habitsState, setHabitsState] = useState<HabitWithStats[]>([])

  useEffect(() => {
    setHabitsState(habits)
  }, [habits])

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
    toast.loading("Alterando status do hábito...", { id: "toggle-habit" })

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
      const response = await axios.post(`/api/habits/${habitId}/toggle`, {
        date,
      })
      return response.data
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["habits"] })
    },

    onError: (error: any) => {
      toast.error(error?.message || "Erro ao alterar status do hábito", {
        id: "toggle-habit",
      })
    },
  })

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setHabitsState((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)

      return arrayMove(items, oldIndex, newIndex)
    })
  }

  return (
    <div className="flex flex-col space-y-6">
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

      {habitsState.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🎯</div>

          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Comece sua jornada
          </h2>

          <CreateHabitDialog
            trigger={
              <Button size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Criar hábito
              </Button>
            }
          />
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext
            items={habitsState.map((h) => h.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {habitsState.map((habit) => (
                <SortableHabit
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  isPending={isPending}
                  onToggle={(id: string) =>
                    handleToggleHabit(id, selectedDate)
                  }
                  onError={handleHabitError}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableHabit({
  habit,
  selectedDate,
  isPending,
  onToggle,
  onError,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: habit.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      {/* HANDLE */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-4"
      >
        <GripVertical size={18} />
      </div>

      {/* CARD */}
      <div className="flex-1">
        <HabitCard
          loading={isPending}
          habit={habit}
          onToggle={(id: string) => onToggle(id)}
          selectedDate={selectedDate}
          onError={onError}
        />
      </div>
    </div>
  )
}

export default ActiveCardHabits