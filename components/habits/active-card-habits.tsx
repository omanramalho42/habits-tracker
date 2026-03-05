"use client"

import React, { useEffect, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"
import { toast } from "sonner"
import confetti from "canvas-confetti"

import { HabitCard } from "@/components/habit-card"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

import { Button } from "@/components/ui/button"

import { ArrowUpDownIcon, GripVertical, Plus, Search } from "lucide-react"

import type { HabitWithStats } from "@/lib/types"

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"
import { DndContext } from "@dnd-kit/core"
import { Input } from "../ui/input"

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

  const toasterId = "toggle-habit"

  const handleToggleHabit = (habitId: string, date: Date) => {
    toast.loading(
      "Alterando status do hábito...", {
        id: `toggle-habit`,
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
      const response = await axios.post(`/api/habits/${habitId}/toggle`, {
        date,
      })
      return response.data
    },

    onSuccess: async () => {
      toast.success(
        "status do hábito alterado com sucesso.", {
          id: `toggle-habit`,
      })
      await queryClient.invalidateQueries({
        queryKey: ["habits"]
      })
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

  const [filter, setFilter] = useState<string>("");
  const handleFilterHabits = (value: string) => {
    setFilter(value)
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

      <div className="flex flex-row gap-2 items-center justify-center">
        <Button variant="outline" type="button" size="icon">
          <Search className="w-4 h-4" />
        </Button>
        <Input
          type="text"
          placeholder="pesquise pelo nome do hábito..."
          value={filter}
          onChange={(event) => {
            handleFilterHabits(event.target.value)
          }}
        />
      </div>
      
      <div className="flex flex-col gap-3 overflow-x-visible px-2" aria-selected={false}>
        <p className="text-sm font-bold text-foreground">
          Hábitos
        </p>
        
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
                {habitsState.map((habit) => habit.name.includes(filter) && (
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
    <div ref={setNodeRef} style={style} className="relative">
      {/* DRAG HANDLE */}
      <Button
        variant="outline"
        size="icon"
        {...attributes}
        {...listeners}
        className="
          absolute 
          top-20
          right-4
          cursor-grab
          active:cursor-grabbing
          text-muted-foreground
          rounded-md
          p-1
          transition
          z-10
        "
      >
        <ArrowUpDownIcon size={18} />
      </Button>

      <HabitCard
        loading={isPending}
        habit={habit}
        onToggle={(id: string) => onToggle(id)}
        selectedDate={selectedDate}
        onError={onError}
      />
    </div>
  )
}

export default ActiveCardHabits