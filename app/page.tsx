"use client"

import { redirect } from "next/navigation"

import { useEffect, useState } from "react"

import { SignOutButton } from "@clerk/nextjs"

import axios from "axios"

import confetti from "canvas-confetti"

import { toast } from "sonner"

import {
  CreateHabitDialog,
  HabitSchemaType
} from "@/components/create-habit-dialog"

import { Button } from "@/components/ui/button"
import { HabitCard } from "@/components/habit-card"
import { HabitDetailDialog } from "@/components/habit-detail-dialog"
import { MoodWizard } from "@/components/mood-wizard"
import { SettingsDialog } from "@/components/settings-dialog"

import { isHabitActiveOnDate, normalizeDateOnly } from "@/lib/habit-utils"

import type { HabitWithStats } from "@/lib/types"

import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  SquareDashedKanban,
  ListIcon
} from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null)
  const [detailHabit, setDetailHabit] = useState<HabitWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMoodWizard, setShowMoodWizard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const [completedToday, setCompletedToday] = useState(0)
  const [activeHabitsForSelectedDate, setActiveHabitsForSelectedDate] = useState<HabitWithStats[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchHabits()
    checkMoodEntry()
  }, [])

  useEffect(() => {
    updateActiveHabitsForSelectedDate(habits)
  }, [selectedDate, habits])

  const checkMoodEntry = async () => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/mood?date=${today}`)
      const entry = await response.json()

      if (!entry) {
        setShowMoodWizard(true)
      }
    } catch (error) {
      console.error("Error checking mood entry:", error)
    }
  }

  const handleMoodComplete = () => {
    setShowMoodWizard(false)
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

  const handleToggleHabit = async (habitId: string, date?: string) => {
    const toastId =
      toast.loading(
        'Marcando hábito como completo...',
        { id: 'toggle-habit' }
      )

    try {
      setIsLoading(true)

      const habit = habits.find((h) => h.id === habitId)
      const dateStr = date || selectedDate.toISOString().split("T")[0]

      // console.log(habitId, "habitId")
      // console.log(dateStr, 'date')
      // console.log(normalizeDateOnly(new Date(dateStr)), 'date str')
      // console.log(habit, 'habit')

      // ANALISAR A COMPARAÇÃO DE DATAS
      //FOI FEITO NO updateActiveHabitsForSelectedDate
      const isCompleting = 
        !habit?.completions?.some(
          (c) => 
            c?.completed_date === dateStr
        )

      console.log(isCompleting, "is completing")
      
      const response = 
        await axios.post(
          `/api/habits/${habitId}/toggle`,
          JSON.stringify({ date: dateStr })
        )

      if (response.data) {
        if (detailHabit && detailHabit.id === habitId) {
          const statsResponse = 
            await axios.get(
              `/api/habits/${habitId}/stats`
            )

          const updatedHabit = statsResponse.data

          setDetailHabit(updatedHabit)
        }

        await fetchHabits()
        if (isCompleting) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
          })
          toast.success(
            "Hábito concluído com sucesso!",
            { id: toastId }
          )
        } else {
          toast.success(
            "Hábito desmarcado com sucesso!",
            { id: toastId }
          )
        }
      }
    } catch (error) {
      if(error instanceof Error) {
        console.log(error.message, "error")
        toast.error(
          error.message,
          { id: toastId }
        )
      }
    } finally {
      setIsLoading(prev => !prev)
    }
  }

  const handleViewDetail = async (habitId: string) => {
    const statsResponse =
      await axios.get(`/api/habits/${habitId}/stats`)

    const habitWithStats =
      await statsResponse.data

    setDetailHabit(habitWithStats)
  }

  const handleHabitError = (message: string) => {
    toast.error(message)
  }

  const getMonthDates = () => {
    const year = selectedYear
    const month = selectedMonth
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(year, month, i + 1)
      return date
    })
  }

  const updateActiveHabitsForSelectedDate = (habits: HabitWithStats[]) => {
    if (!selectedDate || !(selectedDate instanceof Date) || isNaN(selectedDate.getTime())) {
      return
    }
    // console.log(habits, "Habits")
    const selectedDateString =
      selectedDate.toISOString().split("T")[0]
    const activeHabits =
      habits.filter((habit) => 
        isHabitActiveOnDate(habit, selectedDate)
      )
    // console.log(selectedDateString, 'selected date');
    const completedCount = activeHabits.filter((habit) =>
      habit.completions.some(
        (completion) => 
          completion.completed_date === selectedDateString
      ),
    ).length
    // console.log(activeHabits, "active habits")
    setActiveHabitsForSelectedDate(activeHabits)
    setCompletedToday(completedCount)
  }

  const monthDates = getMonthDates()
  const selectedDateString = selectedDate.toISOString().split("T")[0]

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)

    if (newDate.getMonth() !== selectedMonth || newDate.getFullYear() !== selectedYear) {
      setSelectedMonth(newDate.getMonth())
      setSelectedYear(newDate.getFullYear())
    }

    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-date="${newDate.toISOString().split("T")[0]}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }, 100)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    setSelectedDate(newDate)

    const newMonth = newDate.getMonth()
    const newYear = newDate.getFullYear()

    if (newMonth !== selectedMonth || newYear !== selectedYear) {
      setSelectedMonth(newMonth)
      setSelectedYear(newYear)
    }

    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-date="${newDate.toISOString().split("T")[0]}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }, 100)
  }

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const currentMonthYear = new Date(selectedYear, selectedMonth).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto" />
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 bg-primary/10 mx-auto blur-xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Wisey
          </h2>
          <p className="text-muted-foreground">
            Carregando seus hábitos...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <MoodWizard
        open={showMoodWizard}
        onComplete={handleMoodComplete}
      />

      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* HEADER + ACTIONS BUTTONS */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
                Hoje
              </h1>
              <div className="flex flex-row items-center gap-2">
                  <p className="text-sm">
                    Olá 👋
                  </p>
              </div>
              <p className="text-muted-foreground text-base">{today}</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowSettings(true)}
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
              >
                <Settings className="h-6 w-6" />
              </Button>
              <Button
                onClick={() => redirect("/habits")}
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
              >
                <ListIcon className="h-6 w-6" />
              </Button>
              <CreateHabitDialog
                onSuccessCallback={handleCreateHabit}
                trigger={
                  <Button
                    onClick={() => setShowCreateDialog(true)}
                    size="lg"
                    className="rounded-full h-16 w-16 p-0 bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-7 w-7" />
                  </Button>    
                }
              />
              <SignOutButton
                children={
                  <Button variant="ghost">
                    <LogOut className='text-red-500 text-md' />
                  </Button>
                }
              />
              {/* ADICIONAR SELECT LANGUAGE */}
            </div>
          </div>
          
          {/* CURRENT SELECTION DATE */}
          <div className="mb-8 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{currentMonthYear}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-9 w-9">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-9 w-9">
                  <ChevronRight className="h-5 w-5" />
                </Button>
                {/* adicionar button restore to default */}
              </div>
            </div>
          </div>
          
          {/* NAVIGATION CALENDAR */}
          <div className="mb-12 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousDay}
                className="h-10 w-10 shrink-0 bg-muted/50 hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="flex gap-2 min-w-max pb-2">
                  {monthDates.map((date) => {
                    const isSelected =
                      date.toISOString().split("T")[0] === selectedDateString
                    const isToday =
                      date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
                    const dayOfWeek =
                      date.toLocaleDateString("pt-BR", { weekday: "short" })

                    return (
                      <button
                        key={date.toISOString()}
                        data-date={date.toISOString().split("T")[0]}
                        onClick={() => {
                          setSelectedDate(new Date(date))
                        }}
                        className={`flex flex-col items-center justify-center min-w-17.5 py-4 px-3 rounded-xl transition-all ${
                          isSelected
                            ? "bg-linear-to-br from-primary to-blue-600 text-primary-foreground shadow-lg scale-105"
                            : isToday
                              ? "bg-primary/10 text-foreground border-2 border-primary/30"
                              : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase mb-2">{dayOfWeek}</span>
                        <span className="text-2xl font-bold">{date.getDate()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextDay}
                className="h-10 w-10 shrink-0 bg-muted/50 hover:bg-muted"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* CARD ACTIVE HABITS */}
          {completedToday > 0 && activeHabitsForSelectedDate.length > 0 && (
            <div className="bg-linear-to-r from-primary/10 to-blue-600/10 border border-primary/20 rounded-2xl p-6 text-center mb-6 shadow-sm">
              <p className="text-4xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                {completedToday}/{activeHabitsForSelectedDate.length}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Hábitos completos hoje</p>
            </div>
          )}
          {/* LIST HABITS (ARRAY EMPTY) */}
          {activeHabitsForSelectedDate.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                {habits.length === 0 ? "Comece sua jornada" : "Nenhum hábito encontrado para este dia"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {habits.length === 0
                  ? "Crie seu primeiro hábito e comece a construir melhor a sua rotina"
                  : "Nenhum hábito agendado para esta data. Tente selecionar um dia diferente ou crie um novo hábito."}
              </p>
              <CreateHabitDialog
                onSuccessCallback={handleCreateHabit}
                trigger={
                  <Button
                    size="lg"
                    className="bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {habits.length === 0 ? "Crie seu primeiro hábito" : "Criar novo hábito"}
                  </Button>   
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabitsForSelectedDate.map((habit) => (
                <HabitCard
                  loading={isLoading}
                  key={habit.id}
                  habit={habit}
                  onToggle={(id) => handleToggleHabit(id, selectedDateString)}
                  // onEdit={(h) => setEditingHabit(h)}
                  // onDelete={handleDeleteHabit}
                  onClick={() => handleViewDetail(habit.id)}
                  selectedDate={selectedDate}
                  onError={handleHabitError}
                />
              ))}
            </div>
          )}
        </div>

        {/* VIEW HABIT DETAILS */}
        <HabitDetailDialog
          open={!!detailHabit}
          onOpenChange={(open) => !open && setDetailHabit(null)}
          habit={detailHabit}
        />

        {/* CONFIGURAÇÕES */}
        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </main>
    </>
  )
}
