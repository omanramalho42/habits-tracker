"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { 
  FolderOpen, Briefcase, GraduationCap, Heart, Wallet, 
  Dumbbell, Users, Coffee, Gamepad2, Music 
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  WizardBase, 
  StepCard, 
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

// --- SCHEMA & OPTIONS ---
const categorySchema = z.object({
  name: z.string().min(1, "O nome da categoria é obrigatório"),
  emoji: z.string().default("📁"),
  color: z.string().default("#00ff88"),
  context: z.string().min(1, "Selecione um contexto"),
})

type CategorySchemaType = z.infer<typeof categorySchema>

const EMOJI_OPTIONS = ["📁", "💼", "📚", "❤️", "💰", "💪", "👥", "☕", "🎮", "🎵", "🏠", "✈️"]
const COLOR_OPTIONS = ["#00ff88", "#00d4ff", "#ff6b6b", "#ffd93d", "#6c5ce7", "#fd79a8", "#00b894", "#e17055"]

const CONTEXT_OPTIONS = [
  { id: "work", label: "Trabalho", icon: Briefcase, description: "Tarefas profissionais" },
  { id: "study", label: "Estudos", icon: GraduationCap, description: "Aprendizado e cursos" },
  { id: "health", label: "Saúde", icon: Heart, description: "Bem-estar e fitness" },
  { id: "finance", label: "Finanças", icon: Wallet, description: "Dinheiro e investimentos" },
  { id: "fitness", label: "Exercícios", icon: Dumbbell, description: "Treinos e atividades" },
  { id: "social", label: "Social", icon: Users, description: "Relacionamentos" },
  { id: "leisure", label: "Lazer", icon: Coffee, description: "Descanso e hobbies" },
  { id: "gaming", label: "Jogos", icon: Gamepad2, description: "Entretenimento" },
  { id: "creative", label: "Criativo", icon: Music, description: "Arte e criação" },
]

interface CategoryWizardProps {
  onBack: () => void
  onComplete: () => void
}

export function CategoryWizard({ onBack, onComplete }: CategoryWizardProps) {
  const [step, setStep] = useState(1)
  const { playSound } = useSoundContext()
  const queryClient = useQueryClient()
  const totalSteps = 4

  const form = useForm<CategorySchemaType>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      emoji: "📁",
      color: "#00ff88",
      context: "",
    }
  })

  const { control, watch, setValue, handleSubmit, formState: { isSubmitting } } = form
  const values = watch()

  const { mutate } = useMutation({
    mutationFn: async (data: CategorySchemaType) => {
      // await createCategory(data)
      console.log("Categoria criada:", data)
      return new Promise((res) => setTimeout(res, 800))
    },
    onSuccess: () => {
      toast.success("Categoria pronta!")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      onComplete()
    },
    onError: () => toast.error("Erro ao criar categoria")
  })

  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    let isValid = false
    if (step === 1) isValid = await form.trigger(["name"])
    else if (step === 3) isValid = await form.trigger(["context"])
    else isValid = true

    if (isValid && step < totalSteps) {
      if (step === 3) playSound("success")
      setStep(step + 1)
    }
  }

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (step === 1) onBack()
    else setStep(step - 1)
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="h-full">
        <WizardBase
          title="Criar Categoria"
          subtitle={values.name || "Nova categoria"}
          icon={<FolderOpen className="w-5 h-5 text-white" />}
          iconColor="bg-gradient-to-br from-primary to-emerald-400"
          currentStep={step}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={step === totalSteps ? handleSubmit((data) => mutate(data)) : handleNext}
          onComplete={handleSubmit((data) => mutate(data))}
          canProceed={true}
          isLastStep={step === totalSteps}
          isAIStep={step === 4}
        >
          {step === 1 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Nome da categoria</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Projetos Pessoais" onFocus={() => playSound("hover")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Label className="text-sm font-medium mb-3 block">Escolha um Emoji</Label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {EMOJI_OPTIONS.map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => { playSound("click"); setValue("emoji", e); }}
                        className={`w-12 h-12 rounded-sm text-2xl border-2 transition-all ${values.emoji === e ? "border-primary bg-primary/20 scale-110" : "border-border/30 bg-card/50 hover:border-primary/50"}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {step === 2 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Escolha uma cor</h3>
              </div>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { playSound("click"); setValue("color", c); }}
                      className={`w-14 h-14 rounded-sm border-2 transition-all ${values.color === c ? "border-white scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c, boxShadow: values.color === c ? `0 0 20px ${c}` : 'none' }}
                    />
                  ))}
                </div>
                <div 
                  className="flex items-center gap-4 p-4 rounded-sm border-2 mx-auto max-w-xs"
                  style={{ borderColor: values.color, backgroundColor: `${values.color}15` }}
                >
                  <span className="text-3xl">{values.emoji}</span>
                  <div>
                    <p className="font-bold" style={{ color: values.color }}>{values.name || "Categoria"}</p>
                    <p className="text-xs text-muted-foreground">Preview da cor</p>
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {step === 3 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Contexto da categoria</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {CONTEXT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { playSound("click"); setValue("context", opt.id, { shouldValidate: true }); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-sm border-2 transition-all ${values.context === opt.id ? "border-primary bg-primary/10" : "border-border/30 hover:border-primary/50"}`}
                  >
                    <opt.icon className={`w-6 h-6 ${values.context === opt.id ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="text-[10px] font-medium uppercase tracking-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </StepCard>
          )}

          {step === 4 && (
            <AIInsightCard
              title="Categoria Organizada"
              insights={[
                `"${values.name}" ajudará a organizar seu contexto de ${CONTEXT_OPTIONS.find(c => c.id === values.context)?.label.toLowerCase()}.`,
                "Categorizar itens reduz a carga cognitiva no seu dashboard.",
              ]}
              motivationalMessage={isSubmitting ? "Salvando..." : "Sua nova categoria está pronta!"}
            />
          )}
        </WizardBase>
      </form>
    </Form>
  )
}