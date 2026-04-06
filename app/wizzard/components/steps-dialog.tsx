"use client"

import { X, Check } from "lucide-react"

interface StepsDialogProps {
  isOpen: boolean
  onClose: () => void
}

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
    <defs>
      <linearGradient id="flameGradient" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stopColor="#FF4757" />
        <stop offset="100%" stopColor="#FF6B7A" />
      </linearGradient>
    </defs>
    <path 
      d="M12 2C8 6 6 10 6 13C6 17.4 8.7 21 12 21C15.3 21 18 17.4 18 13C18 10 16 6 12 2Z"
      fill="url(#flameGradient)"
    />
    <ellipse cx="12" cy="15" rx="2.5" ry="3" fill="#FFE066" />
  </svg>
)

const FootprintIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M10.5 3C9.67 3 9 4.34 9 6C9 7.66 9.67 9 10.5 9C11.33 9 12 7.66 12 6C12 4.34 11.33 3 10.5 3ZM13.5 3C12.67 3 12 4.34 12 6C12 7.66 12.67 9 13.5 9C14.33 9 15 7.66 15 6C15 4.34 14.33 3 13.5 3ZM7.5 8C6.67 8 6 9.34 6 11C6 12.66 6.67 14 7.5 14C8.33 14 9 12.66 9 11C9 9.34 8.33 8 7.5 8ZM16.5 8C15.67 8 15 9.34 15 11C15 12.66 15.67 14 16.5 14C17.33 14 18 12.66 18 11C18 9.34 17.33 8 16.5 8ZM12 11C9.79 11 8 13.12 8 15.75C8 17.5 9.5 19.5 11 21C11.5 21.5 12.5 21.5 13 21C14.5 19.5 16 17.5 16 15.75C16 13.12 14.21 11 12 11Z"/>
  </svg>
)

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

interface DayStatus {
  completed: boolean
  inProgress?: boolean
}

const daysStatus: DayStatus[] = [
  { completed: true },
  { completed: true },
  { completed: true },
  { completed: false, inProgress: true },
  { completed: false },
  { completed: false },
  { completed: false },
]

export default function StepsDialog({ isOpen, onClose }: StepsDialogProps) {
  if (!isOpen) return null

  const steps = 6825
  const goal = 10000
  const percentage = Math.round((steps / goal) * 100)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-xs">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full" />
        
        <div className="relative bg-[#0c0f0c] rounded-3xl p-5 border border-[#1a2a1a]/50 shadow-2xl">
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 bg-[#1a1a1a] hover:bg-[#252525] rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-[#666]" />
          </button>

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <FlameIcon />
              <div>
                <div className="text-[#888] text-xs uppercase tracking-wider">Streak</div>
                <div className="text-white text-xl font-bold">32 <span className="text-xs font-normal text-[#666] uppercase">days</span></div>
              </div>
            </div>
            <div className="text-[#555]">
              <FootprintIcon />
            </div>
          </div>

          {/* Week progress */}
          <div className="flex items-center justify-between mb-5">
            {weekDays.map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    daysStatus[i].completed
                      ? "bg-green-500"
                      : daysStatus[i].inProgress
                      ? "border-2 border-green-500 border-dashed"
                      : "border-2 border-[#333]"
                  }`}
                >
                  {daysStatus[i].completed && (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  )}
                </div>
                <span className="text-[10px] text-[#666]">{day}</span>
              </div>
            ))}
          </div>

          {/* Steps counter */}
          <div className="space-y-2">
            <div className="text-[#666] text-xs uppercase tracking-wider">Steps</div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-white text-3xl font-bold">{steps.toLocaleString()}</span>
                <span className="text-[#555] text-sm">/{goal.toLocaleString()}</span>
              </div>
              <span className="text-[#888] text-sm">{percentage}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-[#1a2a1a] rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
