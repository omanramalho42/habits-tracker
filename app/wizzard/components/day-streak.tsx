"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, Info } from "lucide-react"

interface DayStreakProps {
  onBack: () => void
}

export default function DayStreak({ onBack }: DayStreakProps) {

  const { data, isLoading } = useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak")
      return res.json()
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Carregando sua sequência...
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "--"
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }

  return (
    <div className="min-h-screen mb-22 bg-[#050505] flex items-center justify-center p-4">
      <div className="relative min-w-62.5">

        <div className="absolute inset-0 bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[44px] -z-10 translate-x-1 translate-y-1" />
        
        <div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#1a1a1a] rounded-full transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <h1 className="text-white text-[15px] font-semibold tracking-wide uppercase">
              Sequência
            </h1>

            <button className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-white border border-[#333] rounded-full">
              <Info className="h-5 w-5" />
            </button>
          </div>

          {/* 🔥 Ícone */}
          <div className="flex justify-center mb-2">
            <div className="text-6xl">🔥</div>
          </div>

          {/* 🔢 Streak */}
          <div className="text-center mb-6">
            <p className="text-white text-[80px] font-bold leading-none">
              {data?.currentStreak ?? 0}
            </p>
            <p className="text-[#888] text-[13px] font-semibold uppercase mt-1">
              dias seguidos
            </p>
          </div>

          {/* 📊 Stats */}
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="text-center">
              <p className="text-white text-[14px] font-medium">
                {formatDate(data?.startedAt)}
              </p>
              <p className="text-[#666] text-[12px] mt-0.5">
                início da sequência
              </p>
            </div>

            <div className="w-px h-10 bg-[#333]" />

            <div className="text-center">
              <p className="text-white text-[14px] font-medium">
                Top 50%
              </p>
              <p className="text-[#555] text-[12px] mt-0.5">
                ranking global
              </p>
            </div>

            <div className="w-px h-10 bg-[#333]" />

            <div className="text-center">
              <p className="text-white text-[14px] font-medium">
                {data?.maxStreak ?? 0}
              </p>
              <p className="text-[#666] text-[12px] mt-0.5">
                melhor sequência
              </p>
            </div>
          </div>

          {/* 📅 Semana */}
          <div className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#1c1c1c]">
            <p className="text-[#888] text-[11px] font-semibold uppercase mb-4">
              Esta semana
            </p>

            <div className="flex justify-between">
              {data?.weekDays?.map((item: any, index: number) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <p className="text-[11px] text-[#666]">
                    {item.day}
                  </p>

                  {item.completed ? (
                    <div className={`w-10 h-10 flex items-center justify-center ${item.highlighted ? "bg-[#1e1e1e] rounded-full" : ""}`}>
                      🔥
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#333]" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 🎯 Progresso */}
          <div className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#1c1c1c]">
            <div className="flex items-center gap-4">

              {/* Atual */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-orange-500 flex items-center justify-center">
                  🔥
                </div>
                <p className="text-white font-bold mt-1">
                  {data?.currentStreak}
                </p>
              </div>

              {/* Barra */}
              <div className="flex-1">
                <div className="text-center mb-2">
                  <span className="text-orange-500 text-sm">
                    {data?.daysToNextMilestone} dias restantes
                  </span>
                </div>

                <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-orange-500 to-blue-400"
                    style={{ width: `${data?.progress ?? 0}%` }}
                  />
                </div>

                <p className="text-[#666] text-xs text-center mt-2">
                  para alcançar a próxima meta
                </p>
              </div>

              {/* Próximo */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-[#333] flex items-center justify-center">
                  🔒
                </div>
                <p className="text-[#666] font-bold mt-1">
                  {data?.nextMilestone}
                </p>
              </div>

            </div>
          </div>

          {/* 💡 Motivação */}
          <div className="bg-[#141414] rounded-2xl p-4 border border-[#1c1c1c]">
            <h3 className="text-white text-[15px] font-semibold mb-2">
              Continue consistente 🚀
            </h3>
            <p className="text-[#666] text-[13px] leading-relaxed">
              Cada dia conta. Quanto mais consistente você for, maior será seu progresso ao longo do tempo.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}