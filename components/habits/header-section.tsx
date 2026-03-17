"use client"

import Link from 'next/link'
import React, { useState } from 'react'

import { SignOutButton, useUser } from '@clerk/nextjs'

const Clock = dynamic(
  async () => await import('react-live-clock'),
  { loading: () => <Skeleton className='w-32 h-10' />}
)

import {
  CreateHabitDialog
} from '@/components/create-habit-dialog'
import CreateCheckPointDialog from '@/components/create-checkpoint-dialog'
import CreateRoutineDialog from '@/components/create-routine-dialog'
import dynamic from 'next/dynamic'
import CreateTaskDialog from '@/components/tasks/create-task-dialog'
import CreateCategorieDialog from '@/components/categories/create-categorie-dialog'
import CreateGoalDialog from '@/components/goals/create-goal-dialog'

import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"


import {
  ChartArea,
  Home,
  LogOut,
  LucideNewspaper,
  Plus,
  Settings,
  Target,
  CheckCircle,
  Repeat,
  ListTodo,
  Tag, 
  ListCollapseIcon
} from 'lucide-react'

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
                variant="outline"
                size="icon"
                className="rounded-full border-border/50 hover:bg-muted"
              >
                <ListCollapseIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              {/* -------- NAV -------- */}
              <DropdownMenuLabel>Navegação</DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/statistics" className="flex items-center gap-2">
                  <ChartArea className="h-4 w-4" />
                  Estatísticas
                </Link>
              </DropdownMenuItem>
             <DropdownMenuItem asChild>
                <Link href="/habits" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Hábitos
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/news" className="flex items-center gap-2">
                  <LucideNewspaper className="h-4 w-4" />
                  Novidades
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* -------- CREATE -------- */}
              <DropdownMenuLabel>Criar</DropdownMenuLabel>

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

              <DropdownMenuSeparator />

              {/* -------- LOGOUT -------- */}
              <DropdownMenuItem asChild>
                <SignOutButton>
                  <button className="flex items-center gap-2 w-full text-red-500">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </SignOutButton>
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* ADICIONAR SELECT LANGUAGE */}
      </div>
    </div>
  )
}

export default HeaderSection