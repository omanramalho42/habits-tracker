"use client"

import React, { useState } from 'react'

import { redirect } from 'next/navigation'

import { SignOutButton, useUser } from '@clerk/nextjs'

import Clock from 'react-live-clock'

import { SettingsDialog } from '@/components/settings-dialog'
import {
  CreateHabitDialog
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import {
  ChartArea,
  Home,
  ListIcon,
  LogOut,
  Plus,
  Settings,
  SquareDashedKanbanIcon
} from 'lucide-react'
import CreateCheckPointDialog from '../create-checkpoint-dialog'
import CreateRoutineDialog from '../create-routine-dialog'
import Link from 'next/link'

const HeaderSection:React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const { user } = useUser()

  return (
    <div className="flex items-start justify-between">
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-1xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
          Olá, {user?.fullName} 👋
        </h1>
        <p className="text-muted-foreground text-base">
          {today}
        </p>
        <h1 className='text-2xl font-bold text-yellow-500'>
          <Clock
            format={'HH:mm:ss'}
            ticking={true}
            timezone={'America/Sao_paulo'}
          />
        </h1>
        <div className="flex gap-3">
          <CreateHabitDialog
            trigger={
              <Button
                aria-label="Criar hábito"
                title="Criar hábito"
                size="icon"
                disabled={loading}
                className="rounded-full p-0 bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-7 w-7" />
              </Button>    
            }
          />
          <CreateCheckPointDialog
            trigger={
              <Button
                size="icon"
                disabled={loading}
                className="rounded-full p-0 bg-linear-to-r from-primary to-red-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-7 w-7" />
              </Button>
            }
          />
          <CreateRoutineDialog
            trigger={
              <Button
                size="icon"
                disabled={loading}
                className="rounded-full p-0 bg-linear-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-7 w-7" />
              </Button>
            }
          />
        </div>  
      </div>

      <div className="flex items-center flex-wrap gap-2">
      {/* CONFIGURAÇÕES */}
        {/* <SettingsDialog
          trigger={
            <Button
              size="icon"
              variant="outline"
              disabled={loading}
              className="rounded-full p-0 border-border/50 hover:bg-muted"
            >
              <Settings className="h-6 w-6" />
            </Button>
          }
        /> */}
        <Button type='button' variant="outline" size="icon">
          <Link href="/settings">
            <Settings className='w-3 h-3'/>
          </Link>
        </Button>
        <Button type='button' variant="outline" size="icon">
          <Link href="/statistics">
            <ChartArea className='w-3 h-3'/>
          </Link>
        </Button>
        <Button type='button' variant="outline" size="icon">
          <Link href="/">
            <Home className='w-3 h-3'/>
          </Link>
        </Button>
        <Button
          onClick={() => redirect("/habits")}
          size="icon"
          variant="outline"
          disabled={loading}
          className="rounded-full p-0 border-border/50 hover:bg-muted"
        >
          <ListIcon className="h-6 w-6" />
        </Button>

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