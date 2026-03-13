'use client'

import { useState } from 'react'
// import { AppHeader } from './app-header'
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
import { Loader, Target, Trash } from 'lucide-react'
import { HabitWithStats } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { fetchHabits } from '@/services/habits'

const HeaderSection =
  dynamic(() => import("@/components/habits/header-section"), {
    loading: () => <Loader className='animated-spin' />
  })

import Footer from '@/components/habits/footer'
import dynamic from 'next/dynamic'

export default function Settings() {
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
    <main className='min-h-screen bg-background'>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto px-4 py-8">
        <HeaderSection />
        {/* <AppHeader title="Ajustes" showSearch={false} showAdd={false} /> */}

        <div className="flex-1 px-4 pb-20 space-y-6">
          {/* Display Settings */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Exibição
            </h2>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
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
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
                  <Target className="size-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">Habit Tracker</h3>
                  <p className="text-sm text-muted-foreground">Versão 1.0.0</p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Acompanhe seus hábitos diários, crie rotinas personalizadas e visualize seu progresso ao longo do tempo.
              </p>
            </div>
          </section>

          {/* Statistics Summary */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Resumo
            </h2>
            <div className="bg-card border border-border rounded-xl divide-y divide-border">
              <div className="flex items-center justify-between p-4">
                <span className="text-sm">Total de Hábitos</span>
                <span className="font-medium">{habits.length}</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm">Hábitos Ativos</span>
                <span className="font-medium">{habits.filter((h) => h.status === "ARCHIVED").length}</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-sm">Hábitos Arquivados</span>
                <span className="font-medium">{archivedCount}</span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h2 className="text-sm font-semibold text-destructive uppercase mb-3">
              Zona de Perigo
            </h2>
            <div className="bg-card border border-destructive/50 rounded-xl p-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium">Resetar Todos os Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Remove todos os hábitos, rotinas, agendamentos e histórico de conclusões.
                  </p>
                </div>
                <Button
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
