"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Target, Calendar, Link2, Flag, Plus, X } from "lucide-react"
import { 
  WizardBase, 
  StepCard, 
  OptionButton, 
  DaySelector,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

interface GoalWizardProps {
  onBack: () => void
  onComplete: () => void
}

export function GoalWizard({ onBack, onComplete }: GoalWizardProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [linkedItems, setLinkedItems] = useState<string[]>([])
  const [checkpoints, setCheckpoints] = useState<string[]>([])
  const [newCheckpoint, setNewCheckpoint] = useState("")
  
  const { playSound } = useSoundContext()
  const totalSteps = 5

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 4) playSound("success")
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      onBack()
    } else {
      setStep(step - 1)
    }
  }

  const addCheckpoint = () => {
    if (newCheckpoint.trim()) {
      playSound("click")
      setCheckpoints([...checkpoints, newCheckpoint.trim()])
      setNewCheckpoint("")
    }
  }

  const removeCheckpoint = (index: number) => {
    playSound("click")
    setCheckpoints(checkpoints.filter((_, i) => i !== index))
  }

  const toggleLinkedItem = (item: string) => {
    playSound("click")
    setLinkedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return name.length > 0
      case 2: return !!(startDate && endDate)
      default: return true
    }
  }

  const availableItems = [
    { type: "habit", name: "Meditar diariamente", emoji: "🧘" },
    { type: "habit", name: "Exercitar 30min", emoji: "🏃" },
    { type: "task", name: "Estudar para prova", emoji: "📚" },
    { type: "task", name: "Projeto de trabalho", emoji: "💼" },
  ]

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Defina sua meta
              </h3>
              <p className="text-sm text-muted-foreground">
                O que voce quer alcançar?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome da Meta</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Perder 10kg em 3 meses"
                  className="bg-card border-border/50 focus:border-primary"
                  onFocus={() => playSound("hover")}
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Descricao <span className="text-muted-foreground">(opcional)</span>
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu objetivo em detalhes..."
                  className="bg-card border-border/50 focus:border-primary min-h-[100px]"
                  onFocus={() => playSound("hover")}
                />
              </div>
            </div>
          </StepCard>
        )
      
      case 2:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Periodo da meta
              </h3>
              <p className="text-sm text-muted-foreground">
                Quando voce vai comecar e quando quer atingir?
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data de Inicio
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-card border-border/50 focus:border-primary"
                    onFocus={() => playSound("hover")}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Data Final
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-card border-border/50 focus:border-primary"
                    onFocus={() => playSound("hover")}
                  />
                </div>
              </div>
              
              {startDate && endDate && (
                <div className="p-4 bg-primary/10 rounded-sm border border-primary/30 text-center">
                  <p className="text-sm text-muted-foreground">Duracao da meta</p>
                  <p className="text-2xl font-bold text-primary font-mono">
                    {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                  </p>
                </div>
              )}
            </div>
          </StepCard>
        )
      
      case 3:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Vincular habitos e tarefas
              </h3>
              <p className="text-sm text-muted-foreground">
                Conecte itens existentes a esta meta
              </p>
            </div>
            
            <div className="space-y-3">
              {availableItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => toggleLinkedItem(item.name)}
                  onMouseEnter={() => playSound("hover")}
                  className={`w-full flex items-center gap-3 p-4 rounded-sm border-2 text-left transition-all ${
                    linkedItems.includes(item.name)
                      ? "border-primary bg-primary/10"
                      : "border-border/30 hover:border-primary/50"
                  }`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                  </div>
                  <Link2 className={`w-4 h-4 ${linkedItems.includes(item.name) ? "text-primary" : "text-muted-foreground"}`} />
                </button>
              ))}
              
              <p className="text-xs text-center text-muted-foreground mt-4">
                Voce podera vincular mais itens depois
              </p>
            </div>
          </StepCard>
        )
      
      case 4:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Checkpoints
              </h3>
              <p className="text-sm text-muted-foreground">
                Divida sua meta em marcos menores
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newCheckpoint}
                  onChange={(e) => setNewCheckpoint(e.target.value)}
                  placeholder="Ex: Perder os primeiros 3kg"
                  className="bg-card border-border/50 focus:border-primary"
                  onKeyDown={(e) => e.key === "Enter" && addCheckpoint()}
                  onFocus={() => playSound("hover")}
                />
                <button
                  onClick={addCheckpoint}
                  className="px-4 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-2">
                {checkpoints.map((cp, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 p-3 bg-card/30 rounded-sm border border-border/20"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                      {i + 1}
                    </div>
                    <span className="flex-1 text-sm text-foreground">{cp}</span>
                    <button 
                      onClick={() => removeCheckpoint(i)}
                      className="p-1 hover:bg-destructive/20 rounded-sm transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                ))}
                
                {checkpoints.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Adicione checkpoints para acompanhar seu progresso
                  </p>
                )}
              </div>
            </div>
          </StepCard>
        )
      
      case 5:
        return (
          <AIInsightCard
            title="Plano Estrategico da IA"
            insights={[
              `Meta "${name}" criada com sucesso!`,
              startDate && endDate 
                ? `Voce tem ${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} dias para atingir seu objetivo.`
                : "Defina datas para acompanhar seu progresso.",
              linkedItems.length > 0 
                ? `${linkedItems.length} item(s) vinculado(s) para ajudar nesta meta.`
                : "Vincule habitos e tarefas para aumentar suas chances de sucesso.",
              checkpoints.length > 0
                ? `${checkpoints.length} checkpoint(s) definido(s). Celebre cada conquista!`
                : "Adicione checkpoints para dividir sua meta em marcos menores.",
            ]}
            motivationalMessage="Metas claras sao o mapa para o sucesso. Voce ja deu o primeiro passo mais importante: decidir comecar!"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <WizardBase
      title="Criar Meta"
      subtitle={name || "Nova meta"}
      icon={<Target className="w-5 h-5 text-white" />}
      iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
      currentStep={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={onComplete}
      canProceed={canProceed()}
      isLastStep={step === totalSteps}
      isAIStep={step === 4}
    >
      {renderStep()}
    </WizardBase>
  )
}
