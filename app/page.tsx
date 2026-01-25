"use client"

import { useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { fetchHabits } from "@/services/habits"

import { MoodWizard } from "@/components/mood-wizard"

import ActiveCardHabits from "@/components/habits/active-card-habits"
import CurrentSectionDate from "@/components/habits/current-section-date"
import HeaderSection from "@/components/habits/header-section"

import type { HabitWithStats } from "@/lib/types"

export default function Home() {
  const today = new Date()
  // today.setHours(0, 0, 0, 0)
  
  const [selectedDate, setSelectedDate] = useState(today)

  const selectedDateStr =
    selectedDate.toISOString().split("T")[0]

  const {
    data: habits = [],
    isLoading,
    isFetching,
    isError,
    error
  } = useQuery<HabitWithStats[]>({
    queryKey: ["habits", selectedDateStr],
    queryFn: () => fetchHabits(selectedDateStr),
    staleTime: 1000 * 60,
    retry: 1,
  })

  // console.log(habits, "habits");

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

          {isError ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold mb-3 text-foreground">
                Não foi possível carregar hábitos
              </h2>
              <p className="text-muted-foreground mb-6">
                {error instanceof Error ? error.message : "Tente novamente em instantes."}
              </p>
            </div>
          ) : (
            <ActiveCardHabits
              habits={habits}
              selectedDate={selectedDate}
            />
          )}
          {/* CARD ACTIVE HABITS */}
        </div>
      </main>
    </>
  )
}
