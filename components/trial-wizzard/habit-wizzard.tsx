"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Flame, Clock, Repeat, Timer, Palette, Sparkles } from "lucide-react"
import { 
  WizardBase, 
  StepCard, 
  OptionButton, 
  DaySelector,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

interface HabitWizardProps {
  onBack: () => void
  onComplete: () => void
}

const EMOJI_OPTIONS = ["🔥", "💪", "📚", "🏃", "💧", "🧘", "✍️", "🎯", "💡", "🌟", "🏋️", "🍎"]
const COLOR_OPTIONS = ["#00ff88", "#00d4ff", "#ff6b6b", "#ffd93d", "#6c5ce7", "#fd79a8"]

type HabitType = "daily" | "counter" | "duration"

export function HabitWizard({ onBack, onComplete }: HabitWizardProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("🔥")
  const [type, setType] = useState<HabitType>("daily")
  const [selectedDays, setSelectedDays] = useState<string[]>(["seg", "ter", "qua", "qui", "sex"])
  const [time, setTime] = useState("08:00")
  const [reminder, setReminder] = useState(true)
  const [color, setColor] = useState("#00ff88")
  const [showAI, setShowAI] = useState(false)
  
  const { playSound } = useSoundContext()
  const totalSteps = 6

  const handleNext = () => {
    if (step === 5) {
      setShowAI(true)
      playSound("success")
    }
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onBack()
    } else {
      setStep(step - 1)
      if (showAI) setShowAI(false)
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const canProceed = () => {
    switch (step) {
      case 1: return name.length > 0
      case 2: return type !== null
      case 3: return selectedDays.length > 0
      default: return true
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Qual habito voce quer criar?
              </h3>
              <p className="text-sm text-muted-foreground">
                De um nome e escolha um emoji para seu novo habito
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome do Habito</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Meditar 10 minutos"
                  className="bg-card border-border/50 focus:border-primary"
                  onFocus={() => playSound("hover")}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">Escolha um Emoji</Label>
                <div className="flex flex-wrap gap-2 justify-center">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        playSound("click")
                        setEmoji(e)
                      }}
                      className={`w-12 h-12 rounded-sm text-2xl border-2 transition-all ${
                        emoji === e 
                          ? "border-primary bg-primary/20 scale-110" 
                          : "border-border/30 bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Preview */}
              <div className="flex items-center justify-center gap-3 p-4 bg-card/30 rounded-sm border border-border/20">
                <span className="text-3xl">{emoji}</span>
                <span className="font-medium text-foreground">
                  {name || "Seu novo habito"}
                </span>
              </div>
            </div>
          </StepCard>
        )
      
      case 2:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Qual o tipo do habito?
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha como voce quer rastrear este habito
              </p>
            </div>
            
            <div className="space-y-3">
              <OptionButton
                selected={type === "daily"}
                onClick={() => setType("daily")}
                icon={<Repeat className="w-5 h-5" />}
                label="Diario"
                description="Marque como completo uma vez por dia"
              />
              <OptionButton
                selected={type === "counter"}
                onClick={() => setType("counter")}
                icon={<Clock className="w-5 h-5" />}
                label="Contador"
                description="Conte quantas vezes fez no dia (ex: copos de agua)"
              />
              <OptionButton
                selected={type === "duration"}
                onClick={() => setType("duration")}
                icon={<Timer className="w-5 h-5" />}
                label="Duracao"
                description="Registre por quanto tempo praticou"
              />
            </div>
          </StepCard>
        )
      
      case 3:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Em quais dias?
              </h3>
              <p className="text-sm text-muted-foreground">
                Selecione os dias da semana para este habito
              </p>
            </div>
            
            <div className="space-y-6">
              <DaySelector 
                selectedDays={selectedDays} 
                onToggleDay={toggleDay} 
              />
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    playSound("click")
                    setSelectedDays(["seg", "ter", "qua", "qui", "sex"])
                  }}
                  className="px-3 py-1 text-xs rounded-sm border border-border/30 hover:border-primary/50 transition-all"
                >
                  Dias uteis
                </button>
                <button
                  onClick={() => {
                    playSound("click")
                    setSelectedDays(["dom", "seg", "ter", "qua", "qui", "sex", "sab"])
                  }}
                  className="px-3 py-1 text-xs rounded-sm border border-border/30 hover:border-primary/50 transition-all"
                >
                  Todos os dias
                </button>
                <button
                  onClick={() => {
                    playSound("click")
                    setSelectedDays(["dom", "sab"])
                  }}
                  className="px-3 py-1 text-xs rounded-sm border border-border/30 hover:border-primary/50 transition-all"
                >
                  Fim de semana
                </button>
              </div>
            </div>
          </StepCard>
        )
      
      case 4:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Horario e Lembrete
              </h3>
              <p className="text-sm text-muted-foreground">
                Defina quando voce quer ser lembrado
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Horario Preferido</Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="bg-card border-border/50 focus:border-primary text-center text-2xl font-mono h-16"
                  onFocus={() => playSound("hover")}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-card/30 rounded-sm border border-border/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-sm bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Ativar lembrete</p>
                    <p className="text-xs text-muted-foreground">Receba notificacoes inteligentes</p>
                  </div>
                </div>
                <Switch 
                  checked={reminder} 
                  onCheckedChange={(checked) => {
                    playSound("click")
                    setReminder(checked)
                  }} 
                />
              </div>
            </div>
          </StepCard>
        )
      
      case 5:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Personalizacao
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha uma cor para seu habito
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Cor do Habito</Label>
                <div className="flex gap-3 justify-center">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        playSound("click")
                        setColor(c)
                      }}
                      className={`w-12 h-12 rounded-sm border-2 transition-all ${
                        color === c 
                          ? "border-white scale-110 shadow-lg" 
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c, boxShadow: color === c ? `0 0 20px ${c}` : 'none' }}
                    />
                  ))}
                </div>
              </div>
              
              {/* Final preview */}
              <div className="p-6 bg-card/30 rounded-sm border border-border/20">
                <p className="text-xs font-mono text-muted-foreground mb-4 text-center">PREVIEW DO HABITO</p>
                <div 
                  className="flex items-center gap-4 p-4 rounded-sm border-2"
                  style={{ borderColor: color, backgroundColor: `${color}10` }}
                >
                  <span className="text-3xl">{emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">
                      {type === "daily" ? "Diario" : type === "counter" ? "Contador" : "Duracao"} • {selectedDays.length} dias/semana • {time}
                    </p>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-full border-2"
                    style={{ borderColor: color }}
                  />
                </div>
              </div>
            </div>
          </StepCard>
        )
      
      case 6:
        return (
          <AIInsightCard
            title="Analise da IA para seu Habito"
            insights={[
              `Otimo! "${name}" e um habito que pode transformar sua rotina.`,
              `Fazer isso ${selectedDays.length}x por semana as ${time} cria uma ancora temporal forte.`,
              "Comece pequeno: os primeiros 21 dias sao criticos para formar o habito.",
              "Use o sistema de streaks para manter a motivacao alta!",
            ]}
            motivationalMessage="Voce esta a um passo de transformar sua vida. Cada pequeno habito se torna uma grande mudanca. Comece hoje!"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <WizardBase
      title="Criar Habito"
      subtitle={`${emoji} ${name || "Novo habito"}`}
      icon={<Flame className="w-5 h-5 text-white" />}
      iconColor="bg-gradient-to-br from-orange-500 to-red-500"
      currentStep={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={onComplete}
      canProceed={canProceed()}
      isLastStep={step === totalSteps}
      isAIStep={step === 5}
    >
      {renderStep()}
    </WizardBase>
  )
}
