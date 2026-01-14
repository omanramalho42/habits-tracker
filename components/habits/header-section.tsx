"use client"

import React, { useState } from 'react'

import { redirect } from 'next/navigation'

import { SignOutButton, useUser } from '@clerk/nextjs'

import axios from 'axios'

import { SettingsDialog } from '@/components/settings-dialog'
import {
  CreateHabitDialog,
  HabitSchemaType
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import {
  ListIcon,
  LogOut,
  Plus,
  Settings
} from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'

interface HeaderSectionProps {
  onCallbackSuccess: (data: HabitWithStats[]) => void
}

const HeaderSection:React.FC<HeaderSectionProps> = ({ onCallbackSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false)

  const [show, setShow] = useState<boolean>(false)
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const { user } = useUser()

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
      onCallbackSuccess?.(habitsWithStats)

    } catch (error) {
      console.error("Error fetching habits:", error)
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex flex-col">
        <h1 className="text-1xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
          Olá, {user?.fullName} 👋
        </h1>
        <p className="text-muted-foreground text-base">{today}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => setShow(true)}
          size="lg"
          variant="outline"
          disabled={loading}
          className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
        >
          <Settings className="h-6 w-6" />
        </Button>
        <Button
          onClick={() => redirect("/habits")}
          size="lg"
          variant="outline"
          disabled={loading}
          className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
        >
          <ListIcon className="h-6 w-6" />
        </Button>
        <CreateHabitDialog
          onSuccessCallback={handleCreateHabit}
          trigger={
            <Button
              size="lg"
              disabled={loading}
              className="rounded-full h-16 w-16 p-0 bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-7 w-7" />
            </Button>    
          }
        />
        <SignOutButton
          children={
            <Button
              variant="ghost"
              disabled={loading}
            >
              <LogOut className='text-red-500 text-md' />
            </Button>
          }
        />
        {/* ADICIONAR SELECT LANGUAGE */}
      </div>
      {/* CONFIGURAÇÕES */}
      <SettingsDialog
        open={show}
        onOpenChange={setShow}
      />
    </div>
  )
}

export default HeaderSection