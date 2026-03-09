"use client"

import React, { useEffect, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import axios from "axios"
import { toast } from "sonner"
import confetti from "canvas-confetti"

import { HabitCard } from "@/components/habit-card"
import { CreateHabitDialog } from "@/components/create-habit-dialog"

import { Button } from "@/components/ui/button"

import { AlarmCheckIcon, AlarmClock, ArrowUpDownIcon, Clock, Clock10, Filter, GripVertical, Play, PlayCircle, Plus, PlusIcon, Search, StopCircle } from "lucide-react"

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
import { Card } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import CreateRoutineDialog from "../create-routine-dialog"

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
  
  const [done, setDone] = useState(false)

  useEffect(() => {
    setHabitsState(habits)
  }, [])
  useEffect(() => {
    if (habitsState.length === 0) {
      setHabitsState(habits)
    }
  }, [habits])
  // CRIAR ELEMENTO POSITITON (INDEX) EM HABITS
  // CRIAR ROTA PATCH PARA UPDATE DE POSITION APÓS DRAG AND DROP (REORDER)

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

      if (oldIndex < 0 || newIndex < 0) {
        return items
      }

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

      {/* ROUTINES */}
      <div className="flex flex-col gap-1 px-2">
        <p className="text-sm">
          Rotinas
        </p>

        <div className="flex flex-row gap-2 justify-between items-center w-full">
          <p className="text-sm font-bold text-foreground">
            Alimentação
          </p>
          <Input
            className="w-full"
            type="text"
            placeholder="pesquise pelo nome."
            value={filter}
            onChange={(event) => {
              handleFilterHabits(event.target.value)
            }}
          />
          <Button
            variant="outline"
            type="button"
            size="icon-lg"
          >
            <Filter />
          </Button>
        </div>
        <div className="flex flex-col mt-4 gap-3 max-h-[300px] overflow-auto pr-3 scroll-container">
          {['1', '2', '3', '4', '5', '6'].map((item) => {
            return (
              <Card key={item} className="p-4 hover:border-primary/40 transition-all cursor-pointer">
                <div className="flex items-center gap-4">

                  {/* ICON */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                    <span className="text-lg">🌍</span>
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col flex-1">

                    {/* TIME ROW */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">

                      <div className="flex items-center gap-1">
                        <Clock10 className="w-3.5 h-3.5"/>
                        <span>08:00</span>
                      </div>

                      <span className="opacity-40">+</span>

                      <div className="flex items-center gap-1">
                        <AlarmClock className="w-3.5 h-3.5"/>
                        <span>1:30h</span>
                      </div>

                      <span className="opacity-40">→</span>

                      <div className="flex text-orange-400 items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5"/>
                        <span>09:30</span>
                      </div>

                    </div>

                    {/* TITLE */}
                    <p
                      className={`text-sm font-medium transition-all ${
                        done
                          ? "line-through text-muted-foreground opacity-60"
                          : "text-foreground"
                      }`}
                    >
                      Café da manhã
                    </p>

                  </div>
                  {/* CHECKBOX */}
                  <Checkbox
                    className="mt-1"
                    checked={done}
                    onCheckedChange={(value) => setDone(!!value)}
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
      
      {/* HABITS */}
      <div className="flex mt-10 flex-col gap-2 px-2 max-h-[450px] overflow-auto pr-3 scroll-container" aria-selected={false}>
        <div className="flex flex-row justify-between gap-2 items-center w-full">
          <p className="text-sm font-bold text-foreground">
            Hábitos
          </p>
          <div className="flex flex-row gap-2 w-full items-center justify-center">
            <Input
              type="text"
              placeholder="pesquise pelo nome."
              value={filter}
              onChange={(event) => {
                handleFilterHabits(event.target.value)
              }}
            />
          </div>
          <Button
            variant="outline"
            type="button"
            size="icon-lg"
          >
            <Filter />
          </Button>
        </div>
        
        <div className="my-4">
          {habitsState.length === 0 ? (
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