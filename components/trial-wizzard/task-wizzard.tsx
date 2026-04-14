"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckSquare, FileText, Repeat, BarChart3, Clock, Sparkles } from "lucide-react"
import { 
  WizardBase, 
  StepCard, 
  OptionButton,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

interface TaskWizardProps {
  onBack: () => void
  onComplete: () => void
}

type TaskType = "simple" | "recurring" | "metric"

export function TaskWizard({ onBack, onComplete }: TaskWizardProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TaskType>("simple")
  const [duration, setDuration] = useState("30")
  const [metricName, setMetricName] = useState("")
  const [metricUnit, setMetricUnit] = useState("")
  const [category, setCategory] = useState("")
  
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

  const canProceed = () => {
    switch (step) {
      case 1: return name.length > 0
      case 2: return type !== null
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
                Descreva sua tarefa
              </h3>
              <p className="text-sm text-muted-foreground">
                De um nome e uma descricao detalhada
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome da Tarefa</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Estudar para prova"
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
                  placeholder="Detalhes sobre sua tarefa..."
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
                Tipo de tarefa
              </h3>
              <p className="text-sm text-muted-foreground">
                Como voce quer rastrear esta tarefa?
              </p>
            </div>
            
            <div className="space-y-3">
              <OptionButton
                selected={type === "simple"}
                onClick={() => setType("simple")}
                icon={<FileText className="w-5 h-5" />}
                label="Simples"
                description="Apenas marque como concluida"
              />
              <OptionButton
                selected={type === "recurring"}
                onClick={() => setType("recurring")}
                icon={<Repeat className="w-5 h-5" />}
                label="Recorrente"
                description="Repete em intervalos definidos"
              />
              <OptionButton
                selected={type === "metric"}
                onClick={() => setType("metric")}
                icon={<BarChart3 className="w-5 h-5" />}
                label="Com Metricas"
                description="Registre valores numericos (ex: paginas lidas)"
              />
            </div>
          </StepCard>
        )
      
      case 3:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Tempo estimado
              </h3>
              <p className="text-sm text-muted-foreground">
                Quanto tempo essa tarefa leva?
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Duracao (minutos)</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="flex-1 accent-primary"
                  />
                  <div className="w-20 h-12 rounded-sm border-2 border-primary bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-primary">{duration}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-center flex-wrap">
                {["15", "30", "45", "60", "90", "120"].map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      playSound("click")
                      setDuration(d)
                    }}
                    className={`px-4 py-2 rounded-sm border-2 font-mono text-sm transition-all ${
                      duration === d 
                        ? "border-primary bg-primary/20 text-primary" 
                        : "border-border/30 hover:border-primary/50"
                    }`}
                  >
                    {d}min
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-card/30 rounded-sm border border-border/20">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Tempo estimado: <span className="text-primary font-mono">{duration} minutos</span>
                </span>
              </div>
            </div>
          </StepCard>
        )
      
      case 4:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {type === "metric" ? "Configure as metricas" : "Categoria"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {type === "metric" 
                  ? "Defina o que voce quer medir" 
                  : "Organize sua tarefa em uma categoria"}
              </p>
            </div>
            
            {type === "metric" ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Nome da Metrica</Label>
                  <Input
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="Ex: Paginas lidas"
                    className="bg-card border-border/50 focus:border-primary"
                    onFocus={() => playSound("hover")}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Unidade</Label>
                  <Input
                    value={metricUnit}
                    onChange={(e) => setMetricUnit(e.target.value)}
                    placeholder="Ex: paginas, km, litros"
                    className="bg-card border-border/50 focus:border-primary"
                    onFocus={() => playSound("hover")}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {["Trabalho", "Estudos", "Saude", "Pessoal", "Financeiro", "Outro"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        playSound("click")
                        setCategory(cat)
                      }}
                      className={`p-4 rounded-sm border-2 text-sm font-medium transition-all ${
                        category === cat 
                          ? "border-primary bg-primary/20 text-primary" 
                          : "border-border/30 hover:border-primary/50 text-muted-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </StepCard>
        )
      
      case 5:
        return (
          <AIInsightCard
            title="Analise da IA para sua Tarefa"
            insights={[
              `A tarefa "${name}" foi estimada em ${duration} minutos.`,
              "Divida em blocos de 25min (Pomodoro) para maior foco.",
              "Recomendamos fazer esta tarefa no periodo da manha quando seu foco e maior.",
              type === "metric" 
                ? `Metrificar "${metricName}" ajuda a visualizar seu progresso!`
                : "Vincule esta tarefa a um objetivo maior para aumentar sua motivacao.",
            ]}
            motivationalMessage="Tarefas completadas sao degraus para seus objetivos. Cada checkmark e uma vitoria!"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <WizardBase
      title="Criar Tarefa"
      subtitle={name || "Nova tarefa"}
      icon={<CheckSquare className="w-5 h-5 text-white" />}
      iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
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
