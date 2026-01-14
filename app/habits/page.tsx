"use client"

import Link from "next/link"
import React, { useEffect, useState } from 'react'

import axios from 'axios'

import { toast } from 'sonner'

import { HabitCard } from '@/components/habit-card'
import { UpdateHabitSchemaType } from '@/components/update-habit-dialog'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { HabitWithStats } from '@/lib/types'

export default function page() {
  const [habits, setHabits] =
    useState<HabitWithStats[]>([])
  const [loading, setLoading] =
    useState<boolean>(false);
  
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
      setHabits(habitsWithStats)
    } catch (error) {
      console.error("Error fetching habits:", error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchHabits()
  }, [])

  const handleUpdateHabit = async (data: UpdateHabitSchemaType) => {
    console.log(data, 'handle update here')
    const toastId = toast.loading(
      "Atualizando hábito...",
      { id: 'update-habit' }
    )
    try {
      const response = 
        await axios.patch(
          `/api/habits/${data.id}`,
          data,
        )

      if (response.data) {
        await fetchHabits()

        toast.success(
          "Hábito atualizado com sucesso.",
          { id: toastId }
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message)
        toast.error(
          error.message,
          { id: toastId }
        )
      }
    }

    await fetchHabits()
  }

  const handleDeleteHabit = async (habitId: string) => {
    const toastId = toast.loading(
      "Deletando hábito...",
      { id: 'delete-habit' }
    )
    try {
      const response =
        await axios.delete(`/api/habits/${habitId}`)

      if (response.data) {
        await fetchHabits()

        toast.success(
          "Hábito deletado com sucesso.",
          { id: toastId }
        )
      }
    } catch (error) {
      if(error instanceof Error) {
        console.log(error.message)
        toast.error(
          error.message,
          { id: toastId }
        )
      }
    }
  }
  
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
                  <span className="sr-only">Toggle menu</span>
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
          {habits.map((habit) => (
            <HabitCard
              loading={loading}
              key={habit.id}
              habit={habit}
              onDelete={handleDeleteHabit}
              onEdit={handleUpdateHabit}
            />
          ))}
        </div>
      </div>
    </main>
  )
}
