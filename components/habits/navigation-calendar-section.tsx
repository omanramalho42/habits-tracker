"use client"

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavigationCalendarSectionProps {
  selectedDate: Date
  onCallbackSuccess: (date: Date) => void
  selectedMonth: number
  setSelectedMonth: (dateIdx: number) => void
  selectedYear: number
  setSelectedYear: (dateIdx: number) => void
}

const NavigationCalendarSection:React.FC<NavigationCalendarSectionProps> = ({
  onCallbackSuccess,
  selectedDate,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear
}) => {
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

  const monthDates = getMonthDates()

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onCallbackSuccess(newDate)

    if (
      newDate.getMonth() !== selectedMonth || 
      newDate.getFullYear() !== selectedYear
    ) {
      setSelectedMonth(newDate.getMonth())
      setSelectedYear(newDate.getFullYear())
    }

    setTimeout(() => {
      const selectedElement =
        document.querySelector(
          `[data-date="${newDate.toISOString().split("T")[0]}"]`
        )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        })
      }
    }, 100)
  }

  const goToNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    onCallbackSuccess(newDate)

    const newMonth = newDate.getMonth()
    const newYear = newDate.getFullYear()

    if (
      newMonth !== selectedMonth ||
      newYear !== selectedYear
    ) {
      setSelectedMonth(newMonth)
      setSelectedYear(newYear)
    }

    setTimeout(() => {
      const selectedElement = 
        document.querySelector(
          `[data-date="${newDate.toISOString().split("T")[0]}"]`
        )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        })
      }
    }, 100)
  }

  const selectedDateString =
    selectedDate.toISOString().split("T")[0]

  return (
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
                    onCallbackSuccess(new Date(date))
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
  )
}

export default NavigationCalendarSection