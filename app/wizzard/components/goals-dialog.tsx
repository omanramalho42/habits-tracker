"use client"

import { Button } from "@/components/ui/button"
import { X, ArrowRight, TrendingUp, Camera, Dumbbell, Briefcase } from "lucide-react"

interface GoalsDialogProps {
  isOpen: boolean
  onClose: () => void
  data: {
    totalGoals: number
    weeklyIncrease: number
    goalsPreview: {
      progress: number
      color: string
      icon: string
    }[]
    remainingCount: number
  }
}

interface ProgressRingProps {
  progress: number
  color: string
  size?: number
  strokeWidth?: number
  icon: React.ReactNode
}

function ProgressRing({ progress, color, size = 56, strokeWidth = 4, icon }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {/* Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon}
      </div>
    </div>
  )
}

export default function GoalsDialog({ isOpen, onClose, data }: GoalsDialogProps) {
  if (!isOpen) return null
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-xs bg-[#0f0f0f] rounded-3xl p-5 border border-[#1a1a1a]">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 bg-[#1a1a1a] hover:bg-[#252525] rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-[#666]" />
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-white text-5xl font-bold">
              {data.totalGoals}
            </div>
            <div className="text-[#666] tracking-tighter text-sm">
              Objetivos totais
            </div>
          </div>
          <Button
            variant="ghost"
            type="button"
            role="button"
            className="flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] tracking-tight text-black font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
          >
            objetivos
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#222] my-4" />

        {/* This week stats */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#1a2a1a] rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
          <span className="text-green-500 tracking-tighter font-medium">
            +{data.weeklyIncrease} Objetivos nesta semana
          </span>
        </div>

        {/* Progress rings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {data.goalsPreview?.map((goal, i) => (
              <ProgressRing
                key={i}
                progress={goal.progress}
                color={goal.color}
                icon={goal.icon}
              />
            ))}
          </div>
          
          {/* More goals badge */}
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center border border-[#2a2a2a]">
            <span className="text-white font-semibold text-sm">
              {data.remainingCount}+
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
