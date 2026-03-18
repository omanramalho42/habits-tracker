"use client"


import React, { useEffect } from 'react'

import { motion } from "framer-motion"

import { Button } from '@/components/ui/button'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface NavigationCalendarSectionProps {
  selectedDate: Date
  onSuccessCallback: (date: Date) => void
  selectedMonth: number
  setSelectedMonth: (dateIdx: number) => void
  selectedYear: number
  setSelectedYear: (dateIdx: number) => void
}

const itemHorizontal = {
  hidden: {
    opacity: 0,
    x: 40, // vem da direita
    scale: 0.95,
  },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
}

const NavigationCalendarSection:React.FC<NavigationCalendarSectionProps> = ({
  onSuccessCallback,
  selectedDate,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear
}) => {

  const getMonthDates = () => {
    const now = new Date()

    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
    const daysInMonth = lastDay.getDate()

    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(selectedYear, selectedMonth, i + 1)

      // Copia hora atual
      date.setHours(hours, minutes, seconds)

      return date
    })
  }

  useEffect(() => {
  const dateKey = selectedDate.toLocaleDateString("pt-BR")

  const el = document.querySelector(
    `[data-date="${dateKey}"]`
  )

  if (el) {
    el.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    })
  }
}, [selectedDate])

  const monthDates = getMonthDates()

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    onSuccessCallback(newDate)

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
    onSuccessCallback(newDate)

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
    new Date(selectedDate).toLocaleDateString("pt-BR")

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousDay}
          className="h-10 w-10 shrink-0 bg-muted/50 hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-primary px-4 py-2">
          <div className="flex gap-2 min-w-max pb-2">
            {monthDates.map((date, index) => {
              const isSelected =
                date.toLocaleDateString("pt-BR") === selectedDateString
              const isToday =
                date.toLocaleDateString("pt-BR") === new Date().toLocaleDateString("pt-BR")
              const dayOfWeek =
                date.toLocaleDateString("pt-BR", { weekday: "short" })

              return (
                <motion.div
                  key={date.toISOString()}
                  variants={itemHorizontal}
                  initial="hidden"
                  whileInView="show"
                  viewport={{
                    once: true,
                    margin: "0px -40px 0px -40px", // ativa antes de entrar totalmente
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                >
                  <Button
                    data-date={date.toLocaleDateString("pt-BR")}
                    onClick={() => {
                      onSuccessCallback(new Date(date))
                    }}
                    className={`flex flex-col items-center min-w-14 h-full py-3 px-2 rounded-md cursor-pointer transition-all ${
                      isSelected
                        ? "bg-linear-to-br from-primary to-blue-600 text-primary-foreground shadow-lg scale-105"
                        : isToday
                          ? "bg-primary/10 text-foreground border-2 border-primary/30"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-105"
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase mb-2">
                      {dayOfWeek}
                    </span>
                    <span className="text-2xl font-bold">
                      {date.getDate()}
                    </span>
                  </Button>
                </motion.div>
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