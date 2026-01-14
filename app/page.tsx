"use client"

import { useEffect, useState } from "react"

import axios from "axios"

import { MoodWizard } from "@/components/mood-wizard"

import type { HabitWithStats } from "@/lib/types"

import ActiveCardHabits from "@/components/habits/active-card-habits"
import CurrentSectionDate from "@/components/habits/current-section-date"
import HeaderSection from "@/components/habits/header-section"

export default function Home() {
  const [habits, setHabits] = useState<HabitWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showMoodWizard, setShowMoodWizard] = useState(false)

  useEffect(() => {
    fetchHabits()
    checkMoodEntry()
  }, [])

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
        onSuccessCallback={setHabits}
      />

      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* HEADER + ACTIONS BUTTONS */}
          <HeaderSection
            onCallbackSuccess={setHabits}
          />
          
          {/* CURRENT SELECTION DATE */}
          <CurrentSectionDate
            selectedDate={selectedDate}
            onSuccessCallback={setSelectedDate}
          />

          {/* CARD ACTIVE HABITS */}
          <ActiveCardHabits
            habits={habits}
            selectedDate={selectedDate}
            onSuccessCallback={setHabits}
          />
        </div>
      </main>
    </>
  )
}
