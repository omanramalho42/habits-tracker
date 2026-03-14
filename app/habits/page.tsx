"use client"

import Link from "next/link"
import React, { useCallback, useState } from 'react'

import { HabitCard } from '@/components/habit-card'
import { CreateHabitDialog } from "@/components/create-habit-dialog"

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

import { Loader, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchHabits } from "@/services"

export default function page() {
  const [search, setSearch] = useState<string>("")
  
  const {
    data: habits = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
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
            disabled={isFetching}
            placeholder="pesquise aqui pelo nome do hábito"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(event.target.value)
            }
          />

          {isError ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Não foi possível carregar hábitos
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : "Tente novamente em instantes."}
              </p>
            </div>
          ) : isFetching || isLoading ? (
             <div className="flex w-full items-center justify-center mt-10">
               <Loader className="animate-spin" />
             </div>
          ) : (
            <>
              {isFetching && (
                <div className="flex w-full items-center justify-center mt-4">
                  <Loader className="animate-spin" />
                </div>
              )}
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
                    loading={isFetching}
                    selectedDate={new Date()}
                    habit={habit}
                  />
                </div>
              )) : (
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col text-center text-4xl">
                    🎯
                    <h2 className="text-center text-xl font-bold mb-3 text-foreground">
                      {habits.length === 0 ? "Comece sua jornada" : "Nenhum hábito encontrado para este dia"}
                    </h2>
                  </div>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    {habits.length === 0
                      ? "Crie seu primeiro hábito e comece a construir melhor a sua rotina"
                      : "Nenhum hábito agendado para esta data. Tente selecionar um dia diferente ou crie um novo hábito."}
                  </p>
                  <CreateHabitDialog
                    trigger={
                      <Button
                        aria-label="Criar hábito"
                        title="Criar hábito"
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
            </>
          )}
        </div>
      </div>
    </main>
  )
}
