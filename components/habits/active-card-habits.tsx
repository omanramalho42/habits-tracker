"use client"

import React, { useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"
import { toast } from "sonner"

import { HabitCard } from "@/components/habit-card"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

import { Button } from "@/components/ui/button"

import {
  ArrowUpDownIcon,
  Plus,
} from "lucide-react"

import type { HabitWithStats } from "@/lib/types"

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"
import { DndContext } from "@dnd-kit/core"
import { Input } from "../ui/input"
import confetti from "canvas-confetti"

import { formatDateBR } from "@/lib/utils"

interface ActiveCardHabitsProps {
  habits: HabitWithStats[]
  selectedDate: Date
  filter?: string
}

const ActiveCardHabits: React.FC<ActiveCardHabitsProps> = ({
  habits,
  selectedDate
}) => {
  const queryClient = useQueryClient()

  // const [habitsState, setHabitsState] = useState<HabitWithStats[]>(habits || [])

  // useEffect(() => {
  //   setHabitsState(habits)
  // }, [queryClient])
  // useEffect(() => {
  //   if (habitsState.length === 0) {
  //     setHabitsState(habits)
  //   }
  // }, [habits])
  // CRIAR ELEMENTO POSITITON (INDEX) EM HABITS
  // CRIAR ROTA PATCH PARA UPDATE DE POSITION APÓS DRAG AND DROP (REORDER)

  const handleHabitError = (message: string) => {
    toast.error(message)
  }

  const handleToggleHabit = (habitId: string, date: Date) => {
    toast.loading(
      "Alterando status do hábito...", {
        id: `toggle-habit`,
    })
    // date.setHours(0,0,0,0)
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
      const response =
        await axios.post(`/api/habits/${habitId}/toggle`, {
          date,
        })
      return response.data
    },

    onSuccess: async (values) => {
      toast.success(
        "status do hábito alterado com sucesso.", {
          id: `toggle-habit`,
      })

      const selectedDateStr =
        formatDateBR(selectedDate)

      await queryClient.invalidateQueries({
        queryKey: ["habits", selectedDateStr],
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines", selectedDateStr],
      })

      if(values.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
        })
      }
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

    // setHabitsState((items) => {
    //   const oldIndex = items.findIndex((i) => i.id === active.id)
    //   const newIndex = items.findIndex((i) => i.id === over.id)

    //   if (oldIndex < 0 || newIndex < 0) {
    //     return items
    //   }

    //   return arrayMove(items, oldIndex, newIndex)
    // })
  }

  return (
    <div className="flex flex-col">
      {/* HABITS */}
      <div
        className="flex mt-10 flex-col gap-2 px-2 max-h-112.5 overflow-auto pr-3 scroll-container"
        aria-selected={false}
      >
        {/* EMPRT ARRAY */}
        <div className="my-4">
          {habits.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">🎯</div>

              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Comece sua jornada
              </h2>

              <CreateHabitDialog
                trigger={
                  <Button
                    aria-label="Criar hábito"
                    title="Criar hábito"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Criar hábito
                  </Button>
                }
              />
            </div>
          ) : (
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext
                items={habits.map((h) => h.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 space-y-4">
                  {habits.map((habit) => (
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
    useSortable({
      id: habit.id
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* DRAG HANDLE */}
      <Button
        // disabled={isPending}
        disabled
        variant="outline"
        size="icon-sm"
        {...attributes}
        {...listeners}
        className="
          absolute 
          top-13 sm:top-15
          right-5
          cursor-grab
          active:cursor-grabbing
          text-muted-foreground
          rounded-md
          mt-1
          transition
          z-10
        "
      >
        <ArrowUpDownIcon  />
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