'use client'

import dynamic from 'next/dynamic'

import { useState } from 'react'

const HeaderSection =
dynamic(() => import("@/components/habits/header-section"), {
  loading: () => <Loader className='animated-spin' />
})

import { useQuery } from '@tanstack/react-query'

import { fetchUserSettings } from '@/services/settings'
import {
  fetchHabits,
  fetchRoutines,
  fetchTasks,
  fetchAnnotations,
  fetchGoals,
  fetchCategories
} from "@/services"

import UpdateUserSettingsDialog from '@/components/update-user-settings-dialog'
import Footer from '@/components/habits/footer'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  Bell,
  Crown,
  Loader,
  Pencil,
  Target,
  Trash,
  User
} from 'lucide-react'

import type { HabitWithStats } from '@/lib/types'
import type {
  Annotations,
  Routine,
  Task,
  UserSettings
} from '@prisma/client'
import type { GoalsDTO } from '@/services/goals'
import type { CategoriesDTO } from '@/services/categories'
import CreateUserSettingsDialog from '@/components/create-user-settings-dialog'

export default function Settings() {
  const {
    data: userSettings,
    isLoading
  } = useQuery<UserSettings>({
    queryKey: ["user-settings"],
    queryFn: () => fetchUserSettings(),
  })
  const {
    data: habits = [],
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
  })

  const {
    data: routines = [],
  } = useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: tasks = [],
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: annotations = [],
  } = useQuery<Annotations[]>({
    queryKey: ["annotations"],
    queryFn: () => fetchAnnotations(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: goals = [],
  } = useQuery<GoalsDTO[]>({
    queryKey: ["goals"],
    queryFn: () => fetchGoals(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: categories = [],
  } = useQuery<CategoriesDTO[]>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: 1000 * 60,
    retry: 1,
  })
  const [filters, setFilters] = useState<any>()
  const [showResetDialog, setShowResetDialog] = useState(false)

  const archivedCount = habits.filter((h) => h.status === "ARCHIVED").length

  const handleReset = () => {
    // Clear local storage
    localStorage.removeItem('habits-storage')
    // Reload the page to reset state
    window.location.reload()
  }

  return (
    <main className='min-h-screen bg-background/60'>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto px-4 py-8">
        <HeaderSection />
        {/* <AppHeader title="Ajustes" showSearch={false} showAdd={false} /> */}

        <div className="flex-1 px-4 pb-20 space-y-6">
          {/* ====================================================== */}
          {/* CONTA */}
          {/* ====================================================== */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Conta
            </h2>

            <Card className='bg-card/80'>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                    <User className="text-primary-foreground"/>
                  </div>
                  <div>
                    <p className="font-semibold">
                      Configurações da conta
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Nome, email e preferências do usuário
                    </p>
                  </div>
                </div>
                {userSettings ? (
                  <UpdateUserSettingsDialog
                    trigger={
                      <Button
                        role='button'
                        disabled={isLoading}
                        variant="outline"
                        className="text-sm text-primary"
                      >
                        Editar
                      </Button>
                    }
                    userSettings={userSettings}
                  />
                ) : (
                  <CreateUserSettingsDialog
                    trigger={
                      <Button
                        role='button'
                        disabled={isLoading}
                        variant="outline"
                        className="text-sm text-primary"
                      >
                        Criar
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          </section>
          {/* Display Settings */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Exibição
            </h2>
            <div className="bg-card/80 border border-border rounded-xl divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="show-archived">Mostrar Arquivados</Label>
                  <p className="text-sm text-muted-foreground">
                    Exibir hábitos e rotinas arquivados ({archivedCount})
                  </p>
                </div>
                {/* <Switch
                  id="show-archived"
                  checked={filters.showArchived}
                  onCheckedChange={(checked) => setFilters({ showArchived: checked })}
                /> */}
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Sobre
            </h2>
            <div className="bg-card/80 border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                  <Target className="size-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    Habits App
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Versão 1.0.0 (beta)
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Acompanhe seus hábitos diários, crie rotinas personalizadas e visualize seu progresso ao longo do tempo.
              </p>
            </div>
          </section>

          {/* NOTIFICAÇOES */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Notificações
            </h2>
            <Card className='bg-card/80'>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="size-4"/>
                  <div>
                    <p className="font-medium">
                      Central de notificações
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receber alertas e lembretes
                    </p>
                  </div>
                </div>
                <Switch
                  disabled
                  // checked={notifications}
                  // onCheckedChange={setNotifications}
                />
              </CardContent>
            </Card>
          </section>


          {/* THEME */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Tema
            </h2>
            <Card className='bg-card/80'>
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Pencil className="size-4"/>
                  <div>
                    <p className="font-medium">
                      Central de temas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Modificar temas e imagem de fundo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* PLANO */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Plano
            </h2>
            <div className="bg-card/80 border rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="text-primary-foreground"/>
                </div>
                <div>
                  <p className="font-semibold">
                    Plano Gratuito
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade para desbloquear recursos
                  </p>
                </div>
              </div>
              <Badge>FREE</Badge>
            </div>

            <Button disabled className="w-full mt-4">
              <p className='text-surface'>
                Upgrade para PRO
              </p>
            </Button>
          </section>

          {/* ====================================================== */}
          {/* RESUMO DA CONTA */}
          {/* ====================================================== */}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase">
              Resumo da conta
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <StatCard
                label="Hábitos"
                value={habits.length}
              />
              <StatCard
                label="Rotinas"
                value={routines.length}
              />
              <StatCard
                label="Tarefas"
                value={tasks.length}
              />
              <StatCard
                label="Objetivos"
                value={goals.length}
              />
              <StatCard
                label="Categorias"
                value={categories.length}
              />
              <StatCard
                label="Anotações"
                value={annotations.length}
              />
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-sm font-semibold text-destructive uppercase mb-3">
              Zona de Perigo
            </h2>
            <div className="bg-card/80 border border-destructive/50 rounded-xl p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">Resetar Todos os Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Remove todos os hábitos, rotinas, agendamentos e histórico de conclusões.
                  </p>
                </div>
                <Button
                  disabled
                  variant="destructive"
                  onClick={() => setShowResetDialog(true)}
                >
                  <Trash className="size-4 mr-2" />
                  Resetar Dados
                </Button>
              </div>
            </div>
          </section>
        </div>

        {/* Reset Confirmation */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar Todos os Dados</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá remover permanentemente todos os seus hábitos, rotinas, agendamentos e histórico. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, Resetar Tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Footer />
      </div>
    </main>
  )
}

/* ====================================================== */
/* STAT CARD */
/* ====================================================== */
function StatCard({
  label,
  value
}:{
  label:string
  value:number
}){
  return (
    <Card className='bg-card/80'>
      <CardContent className="p-4 text-center">
        <p className="text-2xl font-bold">
          {value}
        </p>

        <p className="text-xs text-muted-foreground">
          {label}
        </p>
      </CardContent>
    </Card>
  )
}