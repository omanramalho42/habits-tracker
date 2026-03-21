"use client"

import React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"

interface RoutineCronCardProps {
  cron?: string | null
}

const parseCron = (cron: string) => {
  const parts = cron.split(" ")

  if (parts.length !== 5) return cron

  const [min, hour, day, month, weekday] = parts

  // casos comuns
  if (day === "*" && month === "*" && weekday === "*") {
    return `Todos os dias às ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
  }

  if (weekday !== "*") {
    return `Dias específicos às ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
  }

  if (day !== "*") {
    return `Dia ${day} às ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`
  }

  return cron
}

const isNow = (cron: string) => {
  const now = new Date()
  const parts = cron.split(" ")

  if (parts.length !== 5) return false

  const [min, hour] = parts

  return (
    Number(min) === now.getMinutes() &&
    Number(hour) === now.getHours()
  )
}

const RoutineCronCard: React.FC<RoutineCronCardProps> = ({ cron }) => {
  if (!cron) return null

  const readable = parseCron(cron)
  const activeNow = isNow(cron)

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs transition-all",

        // base
        "bg-black/40 border border-white/10 backdrop-blur-md",

        // glow padrão
        "shadow-[0_0_10px_rgba(34,197,94,0.2)]",

        // 🔥 ativo agora
        activeNow &&
          "bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.9)] scale-105"
      )}
    >
      <Clock
        className={cn(
          "w-3 h-3",
          activeNow ? "text-white" : "text-green-400"
        )}
      />

      <span
        className={cn(
          "tracking-tight",
          activeNow ? "font-semibold" : "text-muted-foreground"
        )}
      >
        {readable}
      </span>
    </div>
  )
}

export default RoutineCronCard