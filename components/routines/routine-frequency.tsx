import React from 'react'

import { WEEKDAYS } from "@/lib/habit-utils"
import { cn } from "@/lib/utils"

const RoutineFrequencyCard:React.FC<{
  frequency?: string[];
  selectedDate: string
}> = ({
    frequency,
    selectedDate
  }: {
    frequency?: string[]
    selectedDate: string
  }
) => {
  const date = new Date(selectedDate)
  const currentDay = date.getDay() // 0–6

  const todayKey = WEEKDAYS[currentDay]?.key

  if(!frequency) {
    return null
  }

  return (
    <div className="flex items-center gap-1.5">

      {WEEKDAYS.map((day, index) => {
        const isActive = frequency?.includes(day.key)
        const isToday = day.key === todayKey

        return (
          <div
            key={day.key}
            className="flex flex-col items-center gap-1"
          >
            {/* CIRCLE */}
            <div
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-all",

                // NÃO ATIVO
                !isActive && "bg-muted text-muted-foreground",

                // ATIVO
                isActive &&
                  "bg-green-500/20 text-green-400 border border-green-500/30",

                // HOJE (destaque forte)
                isToday &&
                  isActive &&
                  "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.9)] scale-110",

                // HOJE mas não ativo
                isToday &&
                  !isActive &&
                  "border border-muted-foreground/30"
              )}
            >
              {day.keyPtBr}
            </div>

            {/* DOT */}
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",

                !isActive && "bg-muted",

                isActive && "bg-green-400",

                isToday && isActive && "bg-green-500 scale-125"
              )}
            />
          </div>
        )
      })}
    </div>
  )
}

export default RoutineFrequencyCard