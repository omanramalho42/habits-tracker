"use client"

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

interface WizardBaseProps {
  title: string
  subtitle: string
  icon: ReactNode
  iconColor: string
  currentStep: number
  totalSteps: number
  children: ReactNode
  onBack: () => void
  onNext: () => void
  onComplete: () => void
  canProceed?: boolean
  isLastStep?: boolean
  isAIStep?: boolean
  isLoading?: boolean
}

export function WizardBase({
  title,
  subtitle,
  icon,
  iconColor,
  currentStep,
  totalSteps,
  children,
  onBack,
  onNext,
  onComplete,
  canProceed = true,
  isLastStep = false,
  isAIStep = false,
  isLoading
}: WizardBaseProps) {
  const { playSound } = useSoundContext()
  const progress = (currentStep / totalSteps) * 100

  const handleBack = () => {
    playSound("click")
    onBack()
  }

  const handleNext = () => {
    playSound("click")
    if (isLastStep) {
      onComplete()
    } else {
      onNext()
    }
  }

  return (
    <div className="flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-border/30">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={handleBack}
            onMouseEnter={() => playSound("hover")}
            className="p-2 rounded-sm border border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center", iconColor)}>
                {icon}
              </div>
              <div>
                <h2 className="font-bold text-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-primary">
              PASSO {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="relative">
          <Progress value={progress} className="h-2 bg-card" />
          <div 
            className="absolute top-0 left-0 h-2 bg-primary transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
          {/* Progress markers */}
          <div className="absolute top-0 left-0 right-0 h-2 flex justify-between">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full border-2 transition-all",
                  i < currentStep 
                    ? "bg-primary border-primary" 
                    : i === currentStep - 1
                    ? "bg-primary border-primary scale-125"
                    : "bg-card border-border/50"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border/30 bg-card/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            onMouseEnter={() => playSound("hover")}
            className="border-border/50 hover:border-primary/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={handleNext}
            onMouseEnter={() => playSound("hover")}
            disabled={!canProceed}
            className={cn(
              "font-bold transition-all",
              isAIStep 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                : "bg-primary hover:bg-primary/90",
              canProceed && "glow-primary"
            )}
          >
            {isLastStep ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Finalizar
              </>
            ) : isAIStep ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Otimizar com IA
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Step card component
interface StepCardProps {
  children: ReactNode
  className?: string
}

export function StepCard({ children, className }: StepCardProps) {
  return (
    <div className={cn(
      "relative bg-card/50 border-2 border-border/30 rounded-sm p-6",
      "hover:border-primary/30 transition-all",
      className
    )}>
      {/* Pixel corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-primary/50" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-primary/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary/50" />
      {children}
    </div>
  )
}

// Option button for selections
interface OptionButtonProps {
  selected: boolean
  onClick: () => void
  icon?: ReactNode
  label: string
  description?: string
}

export function OptionButton({ selected, onClick, icon, label, description }: OptionButtonProps) {
  const { playSound } = useSoundContext()
  
  return (
    <button
      onClick={() => {
        playSound("click")
        onClick()
      }}
      onMouseEnter={() => playSound("hover")}
      className={cn(
        "relative w-full p-4 rounded-sm border-2 text-left transition-all",
        selected 
          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" 
          : "border-border/30 bg-card/30 hover:border-primary/50 hover:bg-card/50"
      )}
    >
      {/* Pixel corners when selected */}
      {selected && (
        <>
          <div className="absolute top-0 left-0 w-2 h-2 bg-primary" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-primary" />
          <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary" />
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary" />
        </>
      )}
      
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "w-10 h-10 rounded-sm flex items-center justify-center transition-colors",
            selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <p className={cn(
            "font-medium transition-colors",
            selected ? "text-primary" : "text-foreground"
          )}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {selected && (
          <Check className="w-5 h-5 text-primary" />
        )}
      </div>
    </button>
  )
}

// Day selector component
interface DaySelectorProps {
  selectedDays: string[]
  onToggleDay: (day: string) => void
}

const DAYS = [
  { id: "dom", label: "D" },
  { id: "seg", label: "S" },
  { id: "ter", label: "T" },
  { id: "qua", label: "Q" },
  { id: "qui", label: "Q" },
  { id: "sex", label: "S" },
  { id: "sab", label: "S" },
]

export function DaySelector({ selectedDays, onToggleDay }: DaySelectorProps) {
  const { playSound } = useSoundContext()
  
  return (
    <div className="flex gap-2 justify-center">
      {DAYS.map((day) => (
        <button
          key={day.id}
          onClick={() => {
            playSound("click")
            onToggleDay(day.id)
          }}
          onMouseEnter={() => playSound("hover")}
          className={cn(
            "w-10 h-10 rounded-sm border-2 font-bold text-sm transition-all",
            selectedDays.includes(day.id)
              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30"
              : "border-border/30 bg-card/30 text-muted-foreground hover:border-primary/50"
          )}
        >
          {day.label}
        </button>
      ))}
    </div>
  )
}

// AI Insight Card
interface AIInsightCardProps {
  title: string
  insights: string[]
  motivationalMessage: string
}

export function AIInsightCard({ title, insights, motivationalMessage }: AIInsightCardProps) {
  return (
    <div className="space-y-4">
      <div className="relative bg-linear-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-sm p-6">
        <div className="absolute top-0 left-0 w-3 h-3 bg-purple-500" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-pink-500" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-pink-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500" />
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-purple-400">{title}</h3>
        </div>
        
        <ul className="space-y-2 mb-4">
          {insights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-primary mt-1">{">"}</span>
              {insight}
            </li>
          ))}
        </ul>
        
        <div className="pt-4 border-t border-purple-500/20">
          <p className="text-sm text-purple-300 italic">
            {motivationalMessage}
          </p>
        </div>
      </div>
    </div>
  )
}
