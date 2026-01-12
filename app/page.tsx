"use client"

import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

import { currentUser } from "@clerk/nextjs/server"

import axios from "axios"

import { useToast } from "@/hooks/use-toast"

import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { HabitCard } from "@/components/habit-card"
import { CreateHabitDialog } from "@/components/create-habit-dialog"
import { EditHabitDialog } from "@/components/edit-habit-dialog"
import { HabitDetailDialog } from "@/components/habit-detail-dialog"
import { MoodWizard } from "@/components/mood-wizard"
import { SettingsDialog } from "@/components/settings-dialog"
import { Toaster } from "@/components/ui/toaster"

import { isHabitActiveOnDate } from "@/lib/habit-utils"

import type { Habit, HabitWithStats, HabitFormData } from "@/lib/types"

import { Plus, ChevronLeft, ChevronRight, Settings, LogOut } from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"

export default function Home() {
  // const user = currentUser()
  
  // if(!user) {
  //   redirect("/sign-in/redirect='home'")
  // }

  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null)
  const [detailHabit, setDetailHabit] = useState<HabitWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMoodWizard, setShowMoodWizard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

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

  const fetchHabits: () => Promise<void> = async () => {
    try {
      const response = await axios.get("/api/habits")

      const habitsWithStats: HabitWithStats[] = await Promise.all(
        response.data.map(async (habit: any) => {
          const statsResponse = await axios.get(`/api/habits/${habit.id}/stats`)
          return await statsResponse.data
        }),
      )
      console.log(habitsWithStats, "habits with stats")
      setHabits(habitsWithStats)
    } catch (error) {
      console.error("Error fetching habits:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateHabit = async (data: HabitFormData) => {
    const response = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Failed to create habit")
    await fetchHabits()
  }

  const handleUpdateHabit = async (data: HabitFormData) => {
    if (!editingHabit) return

    const response = await fetch(`/api/habits/${editingHabit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) throw new Error("Failed to update habit")
    await fetchHabits()
  }

  const handleToggleHabit = async (habitId: number, date?: string) => {
    try {
      const habit = habits.find((h) => h.id === habitId)
      const dateStr = date || selectedDate.toISOString().split("T")[0]
      const isCompleting = !habit?.completions?.some((c) => c.completedDate === dateStr)

      const response = await fetch(`/api/habits/${habitId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      })

      if (response.ok) {
        await fetchHabits()
        if (detailHabit && detailHabit.id === habitId) {
          const statsResponse = await fetch(`/api/habits/${habitId}/stats`)
          const updatedHabit = await statsResponse.json()
          setDetailHabit(updatedHabit)
        }

        if (isCompleting) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"],
          })
          toast({
            title: "🎉 Sucesso!",
            description: "Hábito concluído com sucesso!",
          })
        } else {
          toast({
            title: "Hábito desmarcado",
            description: "A conclusão foi removida.",
          })
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar hábito. Tente novamente.",
      })
    }
  }

  const handleDeleteHabit = async (habitId: number) => {
    try {
      toast({
        title: "Deletando hábito...",
        description: "Por favor, aguarde.",
      })

      const response = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchHabits()
        if (detailHabit?.id === habitId) setDetailHabit(null)
        if (editingHabit?.id === habitId) setEditingHabit(null)

        toast({
          title: "Sucesso!",
          description: "Hábito deletado com sucesso.",
        })
      } else {
        throw new Error("Failed to delete habit")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao deletar hábito. Tente novamente.",
      })
    }
  }

  const handleViewDetail = async (habitId: number) => {
    const statsResponse = await fetch(`/api/habits/${habitId}/stats`)
    const habitWithStats = await statsResponse.json()
    setDetailHabit(habitWithStats)
  }

  const handleHabitError = (message: string) => {
    toast({
      variant: "destructive",
      title: "Erro",
      description: message,
    })
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

    const selectedDateString = selectedDate.toISOString().split("T")[0]
    const activeHabits = habits.filter((habit) => isHabitActiveOnDate(habit, selectedDate))
    const completedCount = activeHabits.filter((habit) =>
      habit.completions.some((c) => c.completedDate === selectedDateString),
    ).length

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

  const currentMonthYear = new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="rounded-full h-16 w-16 bg-primary/10 mx-auto blur-xl"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Wisey
          </h2>
          <p className="text-muted-foreground">Loading your habits...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <MoodWizard open={showMoodWizard} onComplete={handleMoodComplete} />

      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2 bg-linear-to-r from-primary to-blue-600 bg-clip-text">
                Today
              </h1>
              <p className="text-muted-foreground text-base">{today}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSettings(true)}
                size="lg"
                variant="outline"
                className="rounded-full h-14 w-14 p-0 border-border/50 hover:bg-muted"
              >
                <Settings className="h-6 w-6" />
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="lg"
                className="rounded-full h-16 w-16 p-0 bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-7 w-7" />
              </Button>
            </div>
            <div className="flex gap-3">
              <SignOutButton children={
                <Button variant="ghost">
                  <LogOut className='text-red-500 text-md' />
                </Button>
              } />
            </div>
          </div>

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
              </div>
            </div>
          </div>

          <div className="mb-12 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousDay}
                className="h-10 w-10 flex-shrink-0 bg-muted/50 hover:bg-muted"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="overflow-x-auto flex-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                <div className="flex gap-2 min-w-max pb-2">
                  {monthDates.map((date) => {
                    const isSelected = date.toISOString().split("T")[0] === selectedDateString
                    const isToday = date.toISOString().split("T")[0] === new Date().toISOString().split("T")[0]
                    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" })

                    return (
                      <button
                        key={date.toISOString()}
                        data-date={date.toISOString().split("T")[0]}
                        onClick={() => {
                          setSelectedDate(new Date(date))
                        }}
                        className={`flex flex-col items-center justify-center min-w-[70px] py-4 px-3 rounded-xl transition-all ${
                          isSelected
                            ? "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground shadow-lg scale-105"
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

          {completedToday > 0 && activeHabitsForSelectedDate.length > 0 && (
            <div className="bg-linear-to-r from-primary/10 to-blue-600/10 border border-primary/20 rounded-2xl p-6 text-center mb-6 shadow-sm">
              <p className="text-4xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                {completedToday}/{activeHabitsForSelectedDate.length}
              </p>
              <p className="text-sm text-muted-foreground font-medium">Habits completed today</p>
            </div>
          )}

          {activeHabitsForSelectedDate.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                {habits.length === 0 ? "Start Your Journey" : "No Habits for This Day"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {habits.length === 0
                  ? "Create your first habit and begin building better routines that last"
                  : "No habits scheduled for this date. Try selecting a different day or create a new habit."}
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="lg"
                className="bg-linear-to-r from-primary to-blue-600 hover:opacity-90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {habits.length === 0 ? "Create Your First Habit" : "Create New Habit"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeHabitsForSelectedDate.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggle={(id) => handleToggleHabit(id, selectedDateString)}
                  onEdit={(h) => setEditingHabit(h)}
                  onDelete={handleDeleteHabit}
                  onClick={() => handleViewDetail(habit.id)}
                  selectedDate={selectedDate}
                  onError={handleHabitError}
                />
              ))}
            </div>
          )}
        </div>

        <CreateHabitDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateHabit}
        />

        <EditHabitDialog
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onSubmit={handleUpdateHabit}
          habit={editingHabit}
        />

        <HabitDetailDialog
          open={!!detailHabit}
          onOpenChange={(open) => !open && setDetailHabit(null)}
          habit={detailHabit}
        />

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
        />
      </main>

      <Toaster />
    </>
  )
}
