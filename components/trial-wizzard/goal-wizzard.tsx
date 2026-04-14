"use client"

import { useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { Target, Calendar, Link2, Flag, Plus, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  WizardBase, 
  StepCard, 
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

// --- SCHEMA DE VALIDAÇÃO ---
const goalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().min(1, "Data final é obrigatória"),
  linkedItems: z.array(z.string()).default([]),
  checkpoints: z.array(z.string()).default([]),
})

type GoalSchemaType = z.infer<typeof goalSchema>

interface GoalWizardProps {
  onBack: () => void
  onComplete: () => void
}

const TOTAL_STEPS = 5

export function GoalWizard({ onBack, onComplete }: GoalWizardProps) {
  const [step, setStep] = useState(1)
  const [newCheckpoint, setNewCheckpoint] = useState("")
  const { playSound } = useSoundContext()
  const queryClient = useQueryClient()

  // --- FORM CONFIG ---
  const form = useForm<GoalSchemaType>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      linkedItems: [],
      checkpoints: [],
    }
  })

  const { control, watch, setValue, handleSubmit, formState: { isSubmitting } } = form
  const values = watch()

  // --- MUTATION ---
  const { mutate } = useMutation({
    mutationFn: async (data: GoalSchemaType) => {
      // Simulação da chamada de API (Substituir pela sua action)
      console.log("Salvando meta:", data)
      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success("Meta definida com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      onComplete()
    },
    onError: () => toast.error("Erro ao salvar meta")
  })

  // --- HANDLERS ---
  const handleNext = async () => {
    // Validação manual por step para permitir/bloquear progresso
    if (step === 1) {
      const isValid = await form.trigger(["name"])
      if (!isValid) return
    }
    if (step === 2) {
      const isValid = await form.trigger(["startDate", "endDate"])
      if (!isValid) return
    }

    if (step < TOTAL_STEPS) {
      if (step === 4) playSound("success")
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) onBack()
    else setStep(step - 1)
  }

  const onSubmit = (data: GoalSchemaType) => {
    mutate(data)
  }

  const addCheckpoint = () => {
    if (newCheckpoint.trim()) {
      playSound("click")
      const current = watch("checkpoints")
      setValue("checkpoints", [...current, newCheckpoint.trim()])
      setNewCheckpoint("")
    }
  }

  const removeCheckpoint = (index: number) => {
    playSound("click")
    const current = watch("checkpoints")
    setValue("checkpoints", current.filter((_, i) => i !== index))
  }

  const toggleLinkedItem = (itemName: string) => {
    playSound("click")
    const current = watch("linkedItems")
    const updated = current.includes(itemName)
      ? current.filter(i => i !== itemName)
      : [...current, itemName]
    setValue("linkedItems", updated)
  }

  const availableItems = [
    { type: "habit", name: "Meditar diariamente", emoji: "🧘" },
    { type: "habit", name: "Exercitar 30min", emoji: "🏃" },
    { type: "task", name: "Estudar para prova", emoji: "📚" },
    { type: "task", name: "Projeto de trabalho", emoji: "💼" },
  ]

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="h-full">
        <WizardBase
          title="Criar Meta"
          subtitle={values.name || "Nova meta"}
          icon={<Target className="w-5 h-5 text-white" />}
          iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
          currentStep={step}
          totalSteps={TOTAL_STEPS}
          onBack={handleBack}
          onNext={step === TOTAL_STEPS ? handleSubmit(onSubmit) : handleNext}
          onComplete={handleSubmit(onSubmit)}
          canProceed={true} // A validação é tratada via form.trigger no handleNext
          isLastStep={step === TOTAL_STEPS}
          isAIStep={step === 5}
        >
          {/* STEP 1: IDENTIFICAÇÃO */}
          {step === 1 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Defina sua meta</h3>
                <p className="text-sm text-muted-foreground">O que você quer alcançar?</p>
              </div>
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Meta</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Ex: Perder 10kg em 3 meses" 
                          onFocus={() => playSound("hover")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição <span className="text-muted-foreground">(opcional)</span></FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Descreva seu objetivo em detalhes..." 
                          className="min-h-[100px]"
                          onFocus={() => playSound("hover")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </StepCard>
          )}

          {/* STEP 2: PERÍODO */}
          {step === 2 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Período da meta</h3>
                <p className="text-sm text-muted-foreground">Cronograma para atingir o objetivo</p>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><Calendar className="w-4 h-4 inline mr-1" /> Início</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} onFocus={() => playSound("hover")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel><Flag className="w-4 h-4 inline mr-1" /> Fim</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} onFocus={() => playSound("hover")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {values.startDate && values.endDate && (
                  <div className="p-4 bg-primary/10 rounded-sm border border-primary/30 text-center">
                    <p className="text-sm text-muted-foreground">Duração estimada</p>
                    <p className="text-2xl font-bold text-primary font-mono">
                      {Math.ceil((new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                    </p>
                  </div>
                )}
              </div>
            </StepCard>
          )}

          {/* STEP 3: VINCULAR ITENS */}
          {step === 3 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Vincular hábitos</h3>
                <p className="text-sm text-muted-foreground">Conecte itens que ajudam nesta meta</p>
              </div>
              <div className="space-y-3">
                {availableItems.map((item, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleLinkedItem(item.name)}
                    onMouseEnter={() => playSound("hover")}
                    className={`w-full flex items-center gap-3 p-4 rounded-sm border-2 text-left transition-all ${
                      values.linkedItems.includes(item.name)
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                    </div>
                    <Link2 className={`w-4 h-4 ${values.linkedItems.includes(item.name) ? "text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {/* STEP 4: CHECKPOINTS */}
          {step === 4 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Checkpoints</h3>
                <p className="text-sm text-muted-foreground">Marcos menores para motivação</p>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCheckpoint}
                    onChange={(e) => setNewCheckpoint(e.target.value)}
                    placeholder="Ex: Perder os primeiros 3kg"
                    onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); addCheckpoint(); } }}
                    onFocus={() => playSound("hover")}
                  />
                  <button
                    type="button"
                    onClick={addCheckpoint}
                    className="px-4 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {values.checkpoints.map((cp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-card/30 rounded-sm border border-border/20">
                      <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                      <span className="flex-1 text-sm">{cp}</span>
                      <button type="button" onClick={() => removeCheckpoint(i)} className="p-1 hover:bg-destructive/20 rounded-sm">
                        <X className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* STEP 5: AI INSIGHTS */}
          {step === 5 && (
            <AIInsightCard
              title="Plano Estratégico da IA"
              insights={[
                `Meta "${values.name}" pronta para o lançamento!`,
                values.startDate && values.endDate 
                  ? `Faltam ${Math.ceil((new Date(values.endDate).getTime() - new Date(values.startDate).getTime()) / (1000 * 60 * 60 * 24))} dias para o prazo final.` 
                  : "Defina datas para métricas de tempo.",
                `${values.linkedItems.length} conexões feitas para sustentar o progresso.`,
                `${values.checkpoints.length} marcos definidos no seu radar.`,
              ]}
              motivationalMessage={isSubmitting ? "Sincronizando com a nuvem..." : "Tudo pronto! Vamos começar essa jornada?"}
            />
          )}
        </WizardBase>
      </form>
    </Form>
  )
}