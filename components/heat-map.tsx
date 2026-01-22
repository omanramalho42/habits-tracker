"use client"

import React from "react"
import HeatMap, { HeatMapValue } from "@uiw/react-heat-map"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
// --- INTERFACES ---
interface CompletionValue {
  completedDate?: string 
  completed_date?: string 
}

interface HeatMapHabitProps {
  habitColor: string
  startDate: Date
  endDate: Date | null
  completions: CompletionValue[] // Completions (habit.completions)
  counter: number
}

const HeatMapHabit: React.FC<HeatMapHabitProps> = ({
  habitColor,
  startDate,
  endDate,
  completions,
  counter,
}) => {
  // --- CONSTANTES ---
  const COLOR_COMPLETED = habitColor
  const COLOR_SCHEDULED = 'hsl(var(--muted))' // Azul
  const COLOR_NO_HABIT = "hsl(var(--muted))" // Muted/Preto
  
  // VERIFICAR COMPLETED_DATE NAO DEVERIA SER POSSIVELMENTE NULL
  const valuesCompletions: HeatMapValue[] = completions.map(completion => {
    const baseDate = new Date(completion.completedDate!)

    const formattedDate = baseDate
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "/")

    console.log(formattedDate, counter, 'heat map value')

    return {
      date: formattedDate,
      count: counter // 🟢 COMPLETED (nunca 1)
    }
  })

  const valuesSchdules: HeatMapValue[] = []
  // se não existir endDate → 1 ano
  const endDateYear = endDate || new Date(
    startDate.getFullYear() + 1,
    startDate.getMonth(),
    startDate.getDate()
  )
  endDateYear.setHours(0, 0, 0, 0)

  const currentDate = new Date(startDate)
  while (currentDate <= endDateYear) {
    const formattedDate = currentDate
      .toISOString()
      .split('T')[0]
      .replace(/-/g, '/')
    
    // 🔹 verifica se existe completion
    const hasCompletion = valuesCompletions.some(completion => {
      if (!completion.date) return false

      const completionDate = new Date(completion.date)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '/')

      return completionDate === formattedDate
    })

    let count: number = 0

    // 🔥 regra final
    if (/*isFrequencyDay && */hasCompletion) {
      count = counter // concluído
    }
    // else if (isFrequencyDay) {
    //   count = 0 // esperado mas não concluído
    // } 
    else {
      count = 0 // não existe no cronograma
    }

    valuesSchdules.push({
      date: formattedDate,
      count,
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return (
    <div className="scroll-container w-full">
      <div className="min-w-180 pb-4">
        <HeatMap
          value={valuesSchdules}
          startDate={startDate}
          endDate={endDate || undefined} 
          width={"100%"}
          rectSize={12} 
          space={2}
          style={{
            width: "100%",
            color: "hsl(var(--foreground))", 
          }}
          rectProps={{
            rx: 2, 
            ry: 2, 
          }}
          panelColors={{
            0: COLOR_NO_HABIT,
            1: COLOR_SCHEDULED,
            2: COLOR_COMPLETED,
          }}
          monthLabels={[
            "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
            "Jul", "Ago", "Set", "Out", "Nov", "Dez",
          ]}
          weekLabels={["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]}
          rectRender={(props, data) => {
            if (!data.count) return <rect {...props} />;
            return (
            <Tooltip>
              <TooltipTrigger asChild>
                <rect {...props} />
              </TooltipTrigger>
              <TooltipContent>
                {data.date}
              </TooltipContent>
            </Tooltip>
            );
          }}
        />
      </div>
      {/* --- Legendas --- */}
      <div className="flex justify-start gap-4 text-sm mt-3 flex-wrap">
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm`} style={{ backgroundColor: COLOR_COMPLETED }} />
          <span>Concluído</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm`} style={{ backgroundColor: COLOR_SCHEDULED }} />
          <span>Não Concluído</span>
        </div>
        {/* <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm bg-muted`} style={{ backgroundColor: COLOR_NO_HABIT }} />
          <span>Sem Hábito</span>
        </div> */}
      </div>
    </div>
  )
}

export default HeatMapHabit