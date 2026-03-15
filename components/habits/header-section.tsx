"use client"

import Link from 'next/link'
import React, { useState } from 'react'

import { redirect } from 'next/navigation'

import { SignOutButton, useUser } from '@clerk/nextjs'
import { Skeleton } from '../ui/skeleton'

const Clock = dynamic(async () => await import('react-live-clock'), { loading: () => <Skeleton className='w-10 h-4' />})
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import {
  CreateHabitDialog
} from '@/components/create-habit-dialog'

import { Button } from '@/components/ui/button'

import {
  ChartArea,
  Home,
  ListIcon,
  LogOut,
  LucideNewspaper,
  Plus,
  Settings,
  Target,
  CheckCircle,
  Repeat,
  ListTodo,
  Tag 
} from 'lucide-react'
import CreateCheckPointDialog from '../create-checkpoint-dialog'
import CreateRoutineDialog from '../create-routine-dialog'
import dynamic from 'next/dynamic'
import CreateTaskDialog from '../tasks/create-task-dialog'
import CreateCategorieDialog from '../categories/create-categorie-dialog'
import CreateGoalDialog from '../create-goal-dialog'

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
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type='button'
                variant="outline"
                disabled={loading}
                size="icon"
                aria-label="Criar"
                title="Criar"
                className="
                  rounded-full
                  p-0
                  bg-linear-to-r
                  from-primary
                  to-blue-600
                  hover:opacity-90
                  shadow-lg
                  hover:shadow-xl
                  transition-all
                  border-border/50 hover:bg-muted
                "
              >
                <Plus className="h-7 w-7" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuLabel>
                Criar novo
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <CreateHabitDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Hábito
                  </DropdownMenuItem>
                }
              />

              <CreateCheckPointDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Checkpoint
                  </DropdownMenuItem>
                }
              />

              <CreateRoutineDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <Repeat className="h-4 w-4" />
                    Rotina
                  </DropdownMenuItem>
                }
              />

              <CreateTaskDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <ListTodo className="h-4 w-4" />
                    Tarefa
                  </DropdownMenuItem>
                }
              />

              <CreateCategorieDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Categoria
                  </DropdownMenuItem>
                }
              />

              <CreateGoalDialog
                trigger={
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Objetivo
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          type='button'
          variant="outline"
          className='rounded-full p-0 border-border/50 hover:bg-muted'
          disabled={loading}
          size="icon"
        >
          <Link href="/settings">
            <Settings className='w-3 h-3'/>
          </Link>
        </Button>
        <Button
          type='button'
          variant="outline"
          className='rounded-full p-0 border-border/50 hover:bg-muted'
          disabled={loading}
          size="icon"
        >
          <Link href="/statistics">
            <ChartArea className='w-3 h-3'/>
          </Link>
        </Button>
        <Button
          type='button'
          variant="outline"
          className='rounded-full p-0 border-border/50 hover:bg-muted'
          disabled={loading}
          size="icon"
        >
          <Link href="/">
            <Home className='w-3 h-3'/>
          </Link>
        </Button>
        <Button
          type='button'
          variant="outline"
          className='rounded-full p-0 border-border/50 hover:bg-muted'
          disabled={loading}
          size="icon"
        >
          <Link href="/news">
            <LucideNewspaper className='w-3 h-3'/>
          </Link>
        </Button>
        {/* <Button
          onClick={() => redirect("/habits")}
          size="icon"
          variant="outline"
          disabled={loading}
          className="rounded-full p-0 border-border/50 hover:bg-muted"
        >
          <ListIcon className="h-6 w-6" />
        </Button> */}

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