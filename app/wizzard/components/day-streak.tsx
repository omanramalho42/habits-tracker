"use client"

import { ChevronLeft, Info } from "lucide-react"

interface DayStreakProps {
  onBack: () => void
}

const weekDays = [
  { day: "SEG", completed: true, highlighted: true },
  { day: "TER", completed: true, highlighted: false },
  { day: "QUA", completed: true, highlighted: false },
  { day: "QUI", completed: true, highlighted: false },
  { day: "SEX", completed: true, highlighted: false },
  { day: "SÁB", completed: true, highlighted: false },
  { day: "DOM", completed: false, highlighted: false },
]

function FireIcon({ className, variant = "default" }: { className?: string; variant?: "default" | "large" | "milestone" | "locked" }) {
  if (variant === "large") {
    return (
      <svg className={className} viewBox="0 0 120 160" fill="none">
        {/* Partículas */}
        <circle cx="75" cy="25" r="4" fill="#F97316" opacity="0.8" />
        <circle cx="85" cy="15" r="3" fill="#F97316" opacity="0.6" />
        <circle cx="90" cy="30" r="2" fill="#FB923C" opacity="0.5" />
        
        {/* Chama principal */}
        <path
          d="M60 155C30 155 10 125 10 95C10 65 30 45 45 30C45 50 55 55 60 50C55 70 70 80 80 70C75 90 90 95 95 85C105 100 110 115 95 135C85 150 75 155 60 155Z"
          fill="url(#fireGradientLarge)"
        />
        
        {/* Chama interna */}
        <path
          d="M60 155C45 155 30 140 30 115C30 95 45 85 55 75C55 90 60 92 65 88C62 100 70 105 78 98C75 112 82 115 85 110C92 120 95 130 85 142C78 152 70 155 60 155Z"
          fill="url(#fireGradientInner)"
        />
        
        {/* Núcleo mais claro */}
        <path
          d="M60 155C50 155 42 145 42 130C42 115 52 108 58 100C58 110 62 112 65 108C63 118 68 122 73 117C70 128 75 132 78 128C82 135 84 142 78 148C73 153 67 155 60 155Z"
          fill="url(#fireGradientCore)"
        />
        
        <defs>
          <linearGradient id="fireGradientLarge" x1="60" y1="30" x2="60" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="0.5" stopColor="#EA580C" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="fireGradientInner" x1="60" y1="75" x2="60" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB923C" />
            <stop offset="0.5" stopColor="#F97316" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="fireGradientCore" x1="60" y1="100" x2="60" y2="155" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FED7AA" />
            <stop offset="0.3" stopColor="#FDBA74" />
            <stop offset="0.7" stopColor="#FB923C" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (variant === "milestone") {
    return (
      <svg className={className} viewBox="0 0 40 50" fill="none">
        <path
          d="M20 48C10 48 4 38 4 28C4 18 10 12 16 6C16 14 19 15 20 13C18 20 24 24 28 20C26 28 32 30 34 26C38 32 40 38 34 44C30 48 26 48 20 48Z"
          fill="url(#milestoneGradient)"
        />
        <path
          d="M20 48C14 48 10 42 10 34C10 26 14 22 18 18C18 24 20 25 22 23C21 28 24 30 27 27C26 34 29 36 31 33C33 38 34 42 30 46C27 48 24 48 20 48Z"
          fill="url(#milestoneGradientInner)"
        />
        <defs>
          <linearGradient id="milestoneGradient" x1="20" y1="6" x2="20" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="1" stopColor="#C2410C" />
          </linearGradient>
          <linearGradient id="milestoneGradientInner" x1="20" y1="18" x2="20" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDBA74" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  if (variant === "locked") {
    return (
      <svg className={className} viewBox="0 0 40 50" fill="none">
        <path
          d="M20 48C10 48 4 38 4 28C4 18 10 12 16 6C16 14 19 15 20 13C18 20 24 24 28 20C26 28 32 30 34 26C38 32 40 38 34 44C30 48 26 48 20 48Z"
          fill="#3A3A3C"
        />
        <path
          d="M20 48C14 48 10 42 10 34C10 26 14 22 18 18C18 24 20 25 22 23C21 28 24 30 27 27C26 34 29 36 31 33C33 38 34 42 30 46C27 48 24 48 20 48Z"
          fill="#4A4A4C"
        />
      </svg>
    )
  }

  // Default small fire
  return (
    <svg className={className} viewBox="0 0 32 40" fill="none">
      <path
        d="M16 38C8 38 3 30 3 22C3 14 8 9 13 4C13 10 15 11 16 9C14 14 19 18 22 15C21 21 25 23 27 20C30 24 32 29 27 34C24 38 20 38 16 38Z"
        fill="url(#fireGradient)"
      />
      <path
        d="M16 38C11 38 8 33 8 27C8 21 11 17 14 13C14 18 16 19 17 17C16 21 19 24 22 21C21 26 23 28 25 25C27 29 28 32 24 35C21 38 19 38 16 38Z"
        fill="url(#fireGradientLight)"
      />
      <defs>
        <linearGradient id="fireGradient" x1="16" y1="4" x2="16" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
        <linearGradient id="fireGradientLight" x1="16" y1="13" x2="16" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function DayStreak({ onBack }: DayStreakProps) {
  const currentStreak = 95
  const maxStreak = 95
  const currentMilestone = 60
  const nextMilestone = 100
  const daysToNextMilestone = 5
  const progress = ((currentStreak - currentMilestone) / (nextMilestone - currentMilestone)) * 100

  return (
    <div className="min-h-screen mb-25 bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="relative w-full">
        {/* Device bezel effect */}
        <div className="absolute inset-0 bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[44px] -z-10 translate-x-1 translate-y-1" />
        
        {/* Main Card */}
        {/* <div className="bg-[#0c0c0c] rounded-[40px] border border-[#1c1c1c] overflow-hidden shadow-2xl"> */}
          <div className="">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center text-white hover:bg-[#1a1a1a] rounded-full transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2} />
              </button>
              <h1 className="text-white text-[15px] font-semibold tracking-wide uppercase">
                Day Streak
              </h1>
              <button 
                className="w-10 h-10 flex items-center justify-center text-[#666] hover:text-white border border-[#333] rounded-full transition-colors"
                aria-label="Informações"
              >
                <Info className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Large Fire Icon */}
            <div className="flex justify-center mb-2">
              <FireIcon className="w-[140px] h-[180px]" variant="large" />
            </div>

            {/* Streak Count */}
            <div className="text-center mb-6">
              <p className="text-white text-[80px] font-bold leading-none tracking-tight">
                {currentStreak}
              </p>
              <p className="text-[#888] text-[13px] font-semibold tracking-[0.2em] uppercase mt-1">
                Day Streak
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between px-2 mb-6">
              <div className="text-center">
                <p className="text-white text-[14px] font-medium">25 Nov, 2025</p>
                <p className="text-[#666] text-[12px] mt-0.5">Streak iniciada</p>
              </div>
              <div className="w-px h-10 bg-[#333]" />
              <div className="text-center">
                <p className="text-white text-[14px] font-medium">Top 50%</p>
                <p className="text-[#555] text-[12px] mt-0.5 tracking-[0.15em]">WHOOP</p>
              </div>
              <div className="w-px h-10 bg-[#333]" />
              <div className="text-center">
                <p className="text-white text-[14px] font-medium">{maxStreak}</p>
                <p className="text-[#666] text-[12px] mt-0.5">Max streak</p>
              </div>
            </div>

            {/* This Week Section */}
            <div className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#1c1c1c]">
              <p className="text-[#888] text-[11px] font-semibold tracking-[0.15em] uppercase mb-4">
                Esta Semana
              </p>
              <div className="flex justify-between">
                {weekDays.map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <p className={`text-[11px] font-medium ${item.day === "SÁB" ? "text-white" : "text-[#666]"}`}>
                      {item.day}
                    </p>
                    {item.completed ? (
                      <div className={`w-10 h-10 flex items-center justify-center ${item.highlighted ? "bg-[#1e1e1e] rounded-full" : ""}`}>
                        <FireIcon className="w-7 h-8" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-dashed border-[#333]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="bg-[#141414] rounded-2xl p-4 mb-4 border border-[#1c1c1c]">
              <div className="flex items-center gap-4">
                {/* Current Milestone */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-[#1a1512]">
                    <FireIcon className="w-8 h-10" variant="milestone" />
                  </div>
                  <p className="text-white text-[18px] font-bold mt-1">{currentMilestone}</p>
                </div>

                {/* Progress Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-[#F97316] text-[13px] font-medium">
                      {daysToNextMilestone} dias restantes
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #F97316 0%, #38bdf8 100%)"
                      }}
                    />
                  </div>
                  <p className="text-[#666] text-[11px] text-center mt-2">
                    para desbloquear sua próxima meta.
                  </p>
                </div>

                {/* Next Milestone */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-2 border-[#333] flex items-center justify-center bg-[#1a1a1a]">
                    <FireIcon className="w-8 h-10" variant="locked" />
                  </div>
                  <p className="text-[#666] text-[18px] font-bold mt-1">{nextMilestone}</p>
                </div>
              </div>
            </div>

            {/* Motivational Text */}
            <div className="bg-[#141414] rounded-2xl p-4 border border-[#1c1c1c]">
              <h3 className="text-white text-[15px] font-semibold mb-2">
                Mantenha sua streak para atingir o pico
              </h3>
              <p className="text-[#666] text-[13px] leading-relaxed">
                Continue usando o app para desbloquear melhor sono, mais movimento e maior bem-estar. A ciência é simples: quanto mais consistente você for, mais você se beneficia.
              </p>
            </div>
          </div>
        {/* </div> */}
      </div>
    </div>
  )
}
