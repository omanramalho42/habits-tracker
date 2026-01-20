"use client"

import Link from "next/link"
import React, { useCallback, useEffect, useState } from 'react'

import axios from 'axios'

import { toast } from 'sonner'

import { fetchHabits } from "@/services/habits"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { HabitCard } from '@/components/habit-card'
import { CreateHabitDialog } from "@/components/create-habit-dialog"
import { UpdateHabitSchemaType } from '@/components/update-habit-dialog'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { HabitWithStats } from '@/lib/types'

import { Plus } from "lucide-react"

export default function page() {
  const [search, setSearch] = useState<string>("")
  
  const {
    data: habits = [],
    isLoading,
    isFetching,
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
  })

  const queryClient = useQueryClient()

  const handleUpdateHabit = useCallback((data: UpdateHabitSchemaType) => {
    updateHabitMutation.mutate(data)
  }, [])

  const updateHabitMutation = useMutation({
    mutationFn: async (data: UpdateHabitSchemaType) => {
      return axios.patch(
        `/api/habits/${data.id}`,
        data
      )
    },
    onMutate: () => {
      return toast.loading(
        "Atualizando hábito...",
        { id: "update-habit" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["habits"],
        exact: false,
      })

      toast.success(
        "Hábito atualizado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao atualizar hábito",
        { id: toastId }
      )
    },
  })

  const handleDeleteHabit = useCallback((habitId: string) => {
    deleteHabitMutation.mutate(habitId)
  }, [])

  const deleteHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      return axios.delete(`/api/habits/${habitId}`)
    },
    onMutate: () => {
      return toast.loading(
        "Deletando hábito...",
        { id: "delete-habit" }
      )
    },
    onSuccess: (_, __, toastId) => {
      queryClient.invalidateQueries({
        queryKey: ["habits"],
        exact: false,
      })

      toast.success(
        "Hábito deletado com sucesso.",
        { id: toastId }
      )
    },
    onError: (error: any, _, toastId) => {
      toast.error(
        error?.message ?? "Erro ao deletar hábito",
        { id: toastId }
      )
    },
  })

  return (
    <main className='min-h-screen bg-background'>
      <div className="max-w-5xl mx-auto px-4 py-8">

        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="size-4" />
                  <span className="sr-only">Abrir menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>
                    <Link href="/habits">Hábitos</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <Input
            placeholder="pesquise aqui pelo nome do hábito"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
          />

          {habits.length > 0 ? habits.filter((habit) => {
            if (!search) return true

            const searchValue = search.toLowerCase()

            return (
              habit.name.toLowerCase().includes(searchValue) ||
              habit.emoji?.includes(search)
            )
          }).sort((a, b) => b.completions.length - a.completions.length).map((habit) => (
            <div key={habit.id}>
              <HabitCard
                loading={isLoading}
                habit={habit}
                onDelete={handleDeleteHabit}
                onEdit={handleUpdateHabit}
              />
            </div>
          )) : (
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
                // onSuccessCallback={handleCreateHabit}
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
          )}
        </div>
      </div>
    </main>
  )
}
