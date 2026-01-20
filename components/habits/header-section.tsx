"use client"

import React, { useState } from 'react'

import { redirect } from 'next/navigation'

import { SignOutButton, useUser } from '@clerk/nextjs'

import axios from 'axios'

import { SettingsDialog } from '@/components/settings-dialog'
import {
  CreateHabitDialog
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import {
  ListIcon,
  LogOut,
  Plus,
  Settings
} from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'
import { CreateHabitSchemaType } from '@/lib/schema/habit'

interface HeaderSectionProps {
  onCallbackSuccess?: (data: HabitWithStats[]) => void
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

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex flex-col">
        <h1 className="text-1xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
          Olá, {user?.fullName} 👋
        </h1>
        <p className="text-muted-foreground text-base">{today}</p>
      </div>

      <div className="flex items-center gap-3">
      {/* CONFIGURAÇÕES */}
        <SettingsDialog
          trigger={
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
            >
              <Settings className="h-6 w-6" />
            </Button>
          }
        />
        <Button
          onClick={() => redirect("/habits")}
          size="icon"
          variant="outline"
          disabled={loading}
          className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
        >
          <ListIcon className="h-6 w-6" />
        </Button>
        <CreateHabitDialog
          trigger={
            <Button
              size="icon"
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
              size="icon"
              variant="ghost"
              disabled={loading}
            >
              <LogOut className='text-red-500 text-md' />
            </Button>
          }
        />
        {/* ADICIONAR SELECT LANGUAGE */}
      </div>

    </div>
  )
}

export default HeaderSection