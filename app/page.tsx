"use client"

import { useState } from "react"

import { MoodWizard } from "@/components/mood-wizard"

import type { HabitWithStats } from "@/lib/types"

import ActiveCardHabits from "@/components/habits/active-card-habits"
import CurrentSectionDate from "@/components/habits/current-section-date"
import HeaderSection from "@/components/habits/header-section"
import { useQuery } from "@tanstack/react-query"
import { fetchHabits } from "@/services/habits"

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const selectedDateStr =
    selectedDate.toISOString().split("T")[0]

  const {
    data: habits = [],
    isLoading,
    isFetching,
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits", selectedDateStr],
    queryFn: () => fetchHabits(selectedDateStr),
    staleTime: 1000 * 60,
    retry: 1,
  })

  console.log(habits, "habits");

  if (isLoading) {
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
      {/* <MoodWizard /> */}

      <main className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* HEADER + ACTIONS BUTTONS */}
          <HeaderSection />
          
          {/* CURRENT SELECTION DATE */}
          <CurrentSectionDate
            selectedDate={selectedDate}
            onSuccessCallback={setSelectedDate}
          />

          {/* CARD ACTIVE HABITS */}
          <ActiveCardHabits
            habits={habits}
            selectedDate={selectedDate}
          />
        </div>
      </main>
    </>
  )
}
