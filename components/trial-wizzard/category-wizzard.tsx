"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen, Briefcase, GraduationCap, Heart, Wallet, Dumbbell, Users, Coffee, Gamepad2, Music } from "lucide-react"
import { 
  WizardBase, 
  StepCard, 
  OptionButton, 
  DaySelector,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

interface CategoryWizardProps {
  onBack: () => void
  onComplete: () => void
}

const EMOJI_OPTIONS = ["📁", "💼", "📚", "❤️", "💰", "💪", "👥", "☕", "🎮", "🎵", "🏠", "✈️"]
const COLOR_OPTIONS = [
  "#00ff88", "#00d4ff", "#ff6b6b", "#ffd93d", 
  "#6c5ce7", "#fd79a8", "#00b894", "#e17055"
]

const CONTEXT_OPTIONS = [
  { id: "work", label: "Trabalho", icon: Briefcase, description: "Tarefas profissionais" },
  { id: "study", label: "Estudos", icon: GraduationCap, description: "Aprendizado e cursos" },
  { id: "health", label: "Saude", icon: Heart, description: "Bem-estar e fitness" },
  { id: "finance", label: "Financas", icon: Wallet, description: "Dinheiro e investimentos" },
  { id: "fitness", label: "Exercicios", icon: Dumbbell, description: "Treinos e atividades" },
  { id: "social", label: "Social", icon: Users, description: "Relacionamentos" },
  { id: "leisure", label: "Lazer", icon: Coffee, description: "Descanso e hobbies" },
  { id: "gaming", label: "Jogos", icon: Gamepad2, description: "Entretenimento" },
  { id: "creative", label: "Criativo", icon: Music, description: "Arte e criacao" },
]

export function CategoryWizard({ onBack, onComplete }: CategoryWizardProps) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📁")
  const [color, setColor] = useState("#00ff88")
  const [context, setContext] = useState("")
  
  const { playSound } = useSoundContext()
  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      if (step === 3) playSound("success")
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
                Nome da categoria
              </h3>
              <p className="text-sm text-muted-foreground">
                Como voce quer chamar esta categoria?
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Projetos Pessoais"
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
                  {name || "Nova categoria"}
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
                Escolha uma cor
              </h3>
              <p className="text-sm text-muted-foreground">
                Personalize a aparencia da categoria
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 justify-center">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      playSound("click")
                      setColor(c)
                    }}
                    className={`w-14 h-14 rounded-sm border-2 transition-all ${
                      color === c 
                        ? "border-white scale-110" 
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ 
                      backgroundColor: c, 
                      boxShadow: color === c ? `0 0 20px ${c}` : 'none' 
                    }}
                  />
                ))}
              </div>
              
              {/* Preview */}
              <div 
                className="flex items-center gap-4 p-4 rounded-sm border-2 mx-auto max-w-xs"
                style={{ borderColor: color, backgroundColor: `${color}15` }}
              >
                <span className="text-3xl">{emoji}</span>
                <div>
                  <p className="font-bold" style={{ color }}>{name || "Categoria"}</p>
                  <p className="text-xs text-muted-foreground">0 itens</p>
                </div>
              </div>
            </div>
          </StepCard>
        )
      
      case 3:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Contexto da categoria
              </h3>
              <p className="text-sm text-muted-foreground">
                Que tipo de itens essa categoria vai agrupar?
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {CONTEXT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    playSound("click")
                    setContext(opt.id)
                  }}
                  onMouseEnter={() => playSound("hover")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all ${
                    context === opt.id
                      ? "border-primary bg-primary/10"
                      : "border-border/30 hover:border-primary/50"
                  }`}
                >
                  <opt.icon className={`w-6 h-6 ${context === opt.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-xs font-medium ${context === opt.id ? "text-primary" : "text-foreground"}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </StepCard>
        )
      
      case 4:
        return (
          <AIInsightCard
            title="Descricao Gerada pela IA"
            insights={[
              `Categoria "${name}" criada para organizar seus ${CONTEXT_OPTIONS.find(c => c.id === context)?.description || "itens"}.`,
              "Categorias ajudam a manter o foco separando diferentes areas da sua vida.",
              "Use filtros por categoria para visualizar apenas o que importa no momento.",
              "Voce pode editar ou mesclar categorias a qualquer momento.",
            ]}
            motivationalMessage="Organizacao e o primeiro passo para a produtividade. Com suas categorias definidas, fica mais facil conquistar seus objetivos!"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <WizardBase
      title="Criar Categoria"
      subtitle={name || "Nova categoria"}
      icon={<FolderOpen className="w-5 h-5 text-white" />}
      iconColor="bg-gradient-to-br from-primary to-emerald-400"
      currentStep={step}
      totalSteps={totalSteps}
      onBack={handleBack}
      onNext={handleNext}
      onComplete={onComplete}
      canProceed={canProceed()}
      isLastStep={step === totalSteps}
      isAIStep={step === 3}
    >
      {renderStep()}
    </WizardBase>
  )
}
