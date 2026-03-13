'use client'

import dynamic from 'next/dynamic'
import { useQuery } from '@tanstack/react-query'
import { fetchHabits } from '@/services/habits'

import { useMemo, useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'
import Footer from '@/components/habits/footer'

import type { HabitWithStats } from '@/lib/types'
import { HeatMapRange } from '@/components/heat-map-v2'

const HeatMap =
  dynamic(async () => await import("@/components/heat-map-v2"), {
    loading: () => <Skeleton className='w-full h-64' />
  });
const HeaderSection =
  dynamic(async () => await import("@/components/habits/header-section"), {
    loading: () => <Skeleton />
  });

export default function Statistics() {
  const [selectedHabitId, setSelectedHabitId] =
    useState<string>('all')

  const [viewMode, setViewMode] = useState<HeatMapRange>("week")

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

  const overallStats = useMemo(() => {
    const today = new Date()

    const allCompletions = habits.flatMap((h) => h.completions)

    // taxa média de conclusão (já vem da API)
    const totalRate =
      habits.length > 0
        ? Math.round(
            habits.reduce((sum, habit) => sum + habit.completion_rate, 0) /
              habits.length
          )
        : 0

    // completions últimos 30 dias
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const recentCompletions = allCompletions.filter((c) => {
      const date = new Date(c.completedDate)
      return date >= thirtyDaysAgo && date <= today
    }).length

    // melhor hábito (maior completion_rate)
    const bestHabit =
      habits.length > 0
        ? habits.reduce((best, habit) =>
            habit.completion_rate > best.completion_rate ? habit : best
          )
        : null

    const bestRate = bestHabit?.completion_rate ?? 0

    // maior streak (já vem da API)
    const longestCurrentStreak = habits.reduce(
      (max, habit) => Math.max(max, habit.longest_streak),
      0
    )

    return {
      totalRate,
      recentCompletions,
      bestHabit,
      bestRate,
      longestCurrentStreak,
      totalHabits: habits.length,
    }
  }, [habits])

  const monthlyHistory = useMemo(() => {
    const months: { month: string; total: number; avg: number }[] = []
    const today = new Date()

    const allCompletions = habits.flatMap((h) => h.completions)

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)

      const monthStr = date.toLocaleString("pt-BR", {
        month: "short",
        year: "numeric",
      })

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const daysInMonth = endOfMonth.getDate()

      const monthCompletions = allCompletions.filter((c) => {
        const cDate = new Date(c.completedDate)
        return cDate >= startOfMonth && cDate <= endOfMonth
      }).length

      months.push({
        month: monthStr,
        total: monthCompletions,
        avg:
          habits.length > 0
            ? Math.round((monthCompletions / daysInMonth / habits.length) * 100)
            : 0,
      })
    }

    return months
  }, [habits])

  return (
    <main className='min-h-screen bg-background'>
      <div className="flex flex-col gap-4 max-w-5xl mx-auto px-4 py-8">
        <HeaderSection />
        
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as HeatMapRange)}>
          <TabsList className="w-full">
            <TabsTrigger value="week" className="flex-1">Semana</TabsTrigger>
            <TabsTrigger value="month" className="flex-1">Mês</TabsTrigger>
            <TabsTrigger value="year" className="flex-1">Ano</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary rounded-xl p-4">
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-1">
              {/* <Icons.stats className="size-4" /> */}
              <span className="text-xs">Taxa Geral</span>
            </div>
            <p className="text-3xl font-bold text-primary-foreground">
              {overallStats.totalRate}%
            </p>
            <p className="text-xs text-primary-foreground/70 mt-1">últimos 30 dias</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {/* <Icons.flame className="size-4" /> */}
              <span className="text-xs">Melhor Sequência</span>
            </div>
            <p className="text-3xl font-bold">{overallStats.longestCurrentStreak}</p>
            <p className="text-xs text-muted-foreground mt-1">dias ativos</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {/* <Icons.check className="size-4" /> */}
              <span className="text-xs">Conclusões</span>
            </div>
            <p className="text-3xl font-bold">{overallStats.recentCompletions}</p>
            <p className="text-xs text-muted-foreground mt-1">últimos 30 dias</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {/* <Icons.target className="size-4" /> */}
              <span className="text-xs">Hábitos Ativos</span>
            </div>
            <p className="text-3xl font-bold">{overallStats.totalHabits}</p>
            <p className="text-xs text-muted-foreground mt-1">em acompanhamento</p>
          </div>
        </div>

        {/* Best Habit */}
        {overallStats.bestHabit && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Melhor Desempenho</h3>
            <div className="flex items-center gap-3">
              <div
                className="size-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: overallStats.bestHabit.color }}
              >
                {/* {(() => {
                  const Icon = getIcon(overallStats.bestHabit)
                  return <Icon className="size-6 text-white" />
                })()} */}
              </div>
              <div className="flex-1">
                <p className="font-medium">{overallStats.bestHabit.name}</p>
                <p className="text-sm text-muted-foreground">
                  {overallStats.bestRate}% de conclusão
                </p>
              </div>
              {/* <Icons.flame className="size-6 text-primary" /> */}
            </div>
          </div>
        )}

        {/* Heat Map */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Mapa de Atividade</h3>
            <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Hábitos</SelectItem>
                {habits.length > 0 ? habits.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                )) : <p>Nenhum hábito encontrado.</p>}
              </SelectContent>
            </Select>
          </div>
          <HeatMap
            view={viewMode}
            habitId={selectedHabitId === 'all' ? undefined : selectedHabitId}
          />
        </div>

        {/* Monthly History */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-4">Histórico Mensal</h3>
          <div className="space-y-3">
            {monthlyHistory.map((month) => (
              <div key={month.month} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-20 flex-shrink-0">
                  {month.month}
                </span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-chart-1 rounded-full transition-all"
                    style={{ width: `${month.avg}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {month.total}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Total de conclusões por mês
          </p>
        </div>

        {/* Habit Rankings */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-4">Ranking de Hábitos</h3>
          <div className="space-y-3">
            {habits.map((stat, index) => {
              const Icon = stat.emoji
              return (
                <div key={stat.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      'size-6 rounded-full flex items-center justify-center text-xs font-bold',
                      index === 0 && 'bg-yellow-500/20 text-yellow-500',
                      index === 1 && 'bg-gray-400/20 text-gray-400',
                      index === 2 && 'bg-amber-600/20 text-amber-600',
                      index > 2 && 'bg-secondary text-muted-foreground'
                    )}
                  >
                    {index + 1}
                  </span>
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: stat.color }}
                  >
                    {/* <Icon className="size-4 text-white" /> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{stat.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.current_streak} dias de sequência
                    </p>
                  </div>
                  <span className="text-sm font-bold">{stat.completion_rate}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
