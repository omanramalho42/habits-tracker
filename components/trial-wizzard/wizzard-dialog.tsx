"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HabitWizard } from "./habit-wizzard"
import { TaskWizard } from "./task-wizzard"
import { GoalWizard } from "./goal-wizzard"
import { CategoryWizard } from "./category-wizzard"
import { 
  Flame, 
  CheckSquare, 
  Target, 
  FolderOpen,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

type WizardType = "select" | "habit" | "task" | "goal" | "category"

interface WizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const wizardOptions = [
  {
    id: "habit" as const,
    title: "Criar Habito",
    description: "Construa habitos que transformam sua vida",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    borderColor: "border-orange-500/50",
    glowColor: "shadow-orange-500/20",
  },
  {
    id: "task" as const,
    title: "Criar Tarefa",
    description: "Organize suas atividades do dia",
    icon: CheckSquare,
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/50",
    glowColor: "shadow-blue-500/20",
  },
  {
    id: "goal" as const,
    title: "Criar Meta",
    description: "Defina e alcance seus objetivos",
    icon: Target,
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/50",
    glowColor: "shadow-purple-500/20",
  },
  {
    id: "category" as const,
    title: "Criar Categoria",
    description: "Organize tudo em categorias",
    icon: FolderOpen,
    color: "from-primary to-emerald-400",
    borderColor: "border-primary/50",
    glowColor: "shadow-primary/20",
  },
]

export function WizardDialog({ open, onOpenChange }: WizardDialogProps) {
  const [wizardType, setWizardType] = useState<WizardType>("select")
  const { playSound } = useSoundContext()

  const handleSelectWizard = (type: WizardType) => {
    playSound("click")
    setWizardType(type)
  }

  const handleBack = () => {
    playSound("click")
    setWizardType("select")
  }

  const handleComplete = () => {
    playSound("success")
    setWizardType("select")
    onOpenChange(false)
  }

  const handleClose = () => {
    setWizardType("select")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-2 border-primary/30 p-0">
        {/* Pixel corner decorations */}
        <div className="absolute top-0 left-0 w-3 h-3 bg-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 bg-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary" />
        
        {wizardType === "select" ? (
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-primary/10 border border-primary/30 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-primary">TRIAL WIZARD</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                O que voce quer <span className="text-primary">criar</span>?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Experimente o poder do LABHABIT criando seu primeiro item com a ajuda da IA
              </p>
            </div>

            {/* Options grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wizardOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectWizard(option.id)}
                  onMouseEnter={() => playSound("hover")}
                  className={cn(
                    "relative group p-6 rounded-sm border-2 bg-card/50 text-left transition-all duration-300",
                    "hover:scale-[1.02] hover:bg-card",
                    option.borderColor,
                    `hover:shadow-lg ${option.glowColor}`
                  )}
                >
                  {/* Pixel corners */}
                  <div className={cn("absolute top-0 left-0 w-2 h-2 bg-linear-to-br", option.color)} />
                  <div className={cn("absolute top-0 right-0 w-2 h-2 bg-linear-to-bl", option.color)} />
                  <div className={cn("absolute bottom-0 left-0 w-2 h-2 bg-linear-to-tr", option.color)} />
                  <div className={cn("absolute bottom-0 right-0 w-2 h-2 bg-linear-to-tl", option.color)} />
                  
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-sm flex items-center justify-center bg-linear-to-br",
                      option.color
                    )}>
                      <option.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {option.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer info */}
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                [ USE AS SETAS OU CLIQUE PARA NAVEGAR ]
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {wizardType === "habit" && (
              <HabitWizard onBack={handleBack} onComplete={handleComplete} />
            )}
            {wizardType === "task" && (
              <TaskWizard onBack={handleBack} onComplete={handleComplete} />
            )}
            {wizardType === "goal" && (
              <GoalWizard onBack={handleBack} onComplete={handleComplete} />
            )}
            {wizardType === "category" && (
              <CategoryWizard onBack={handleBack} onComplete={handleComplete} />
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
