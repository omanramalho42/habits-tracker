"use client"

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import NavigationCalendarSection from './navigation-calendar-section'

interface CurrentSectionDateProps {
  selectedDate: Date;
  onSuccessCallback: (date: Date) => void
}

const CurrentSectionDate:React.FC<CurrentSectionDateProps> = ({
  onSuccessCallback,
  selectedDate
}) => {
  const [selectedMonth, setSelectedMonth] =
    useState(new Date(selectedDate).getMonth())
  const [selectedYear, setSelectedYear] =
    useState(new Date(selectedDate).getFullYear())

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

  const currentMonthYear = 
    new Date(selectedYear, selectedMonth)
    .toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    }
  )

  return (
    <div className="mb-8 bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">
          {currentMonthYear}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-9 w-9"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          {/* adicionar button restore to default */}
        </div>
      </div>
      {/* NAVIGATION CALENDAR */}
      <NavigationCalendarSection
        onCallbackSuccess={onSuccessCallback}
        selectedDate={selectedDate}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />
    </div>
  )
}

export default CurrentSectionDate