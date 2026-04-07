'use client'

import dynamic from 'next/dynamic'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs'

import Footer from '@/components/habits/footer'

import HabitStats from '@/components/statistics/habit-stats'
import TaskStats from '@/components/statistics/task-stats'
import RoutineStats from '@/components/statistics/routine-stats'
import CategorieStats from '@/components/statistics/categorie-stats'
import GoalStats from '@/components/statistics/goal-stats'
import AnnotationStats from '@/components/statistics/annotation-stats'

import { HeatMapRange } from '@/components/heat-map-v2'
import {
  fetchHabits,
  fetchRoutines,
  fetchTasks,
  fetchAnnotations,
  fetchGoals,
  fetchCategories
} from "@/services"

import HeaderSection from '@/components/habits/header-section'

import type { Annotations, Routine, Task } from '@prisma/client'

import type { HabitWithStats } from '@/lib/types'
import type { GoalsDTO } from '@/services/goals'
import type { CategoriesDTO } from '@/services/categories'

export default function Statistics() {
  const [viewMode, setViewMode] =
    useState<HeatMapRange>("week")

  const {
    data: habits = [],
    isLoading: habitsLoading,
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits"],
    queryFn: () => fetchHabits(),
    staleTime: 1000 * 60,
  })

  const {
    data: routines = [],
    isLoading: routinesLoading,
  } = useQuery<Routine[]>({
    queryKey: ["routines"],
    queryFn: () => fetchRoutines(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => fetchTasks(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: annotations = [],
    isLoading: notesLoading,
  } = useQuery<Annotations[]>({
    queryKey: ["annotations"],
    queryFn: () => fetchAnnotations(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: goals = [],
    isLoading: goalsLoading,
  } = useQuery<GoalsDTO[]>({
    queryKey: ["goals"],
    queryFn: () => fetchGoals(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery<CategoriesDTO[]>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(),
    staleTime: 1000 * 60,
    retry: 1,
  })

  // console.log({ categories }, { goals }, { annotations }, { tasks }, { routines }, { habits })

  return (
    <main className='min-h-screen bg-transparent'>
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

        <Tabs defaultValue="habits" className="w-full">
          <div className='flex flex-row max-w-full overflox-x-auto scroll-container'>
            <TabsList className="bg-transparent gap-2">
              <TabsTrigger value="habits">Hábitos</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="routines">Rotinas</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="goals">Objetivos</TabsTrigger>
              <TabsTrigger value="notes">Anotações</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="habits">
            <HabitStats
              isLoading={habitsLoading}
              habits={habits}
              viewMode={viewMode}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskStats
              isLoading={tasksLoading}
              tasks={tasks}
            />
          </TabsContent>

          <TabsContent value="routines">
            <RoutineStats
              isLoading={routinesLoading}
              routines={routines}
            />
          </TabsContent>

          <TabsContent value="categories">
            <CategorieStats
              isLoading={categoriesLoading}
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="goals">
            <GoalStats
              isLoading={goalsLoading}
              goals={goals}
            />
          </TabsContent>

          <TabsContent value="notes">
            <AnnotationStats
              isLoading={notesLoading}
              annotations={annotations}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </main>
  )
}
