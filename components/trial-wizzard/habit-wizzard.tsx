"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { Flame, Clock, Repeat, Timer, Sparkles } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  WizardBase, 
  StepCard, 
  OptionButton, 
  DaySelector,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

// --- SCHEMA ---
const EMOJI_OPTIONS = ["🔥", "💪", "📚", "🏃", "💧", "🧘", "✍️", "🎯", "💡", "🌟", "🏋️", "🍎"]
const COLOR_OPTIONS = ["#00ff88", "#00d4ff", "#ff6b6b", "#ffd93d", "#6c5ce7", "#fd79a8"]

const habitSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  emoji: z.string().default("🔥"),
  type: z.enum(["daily", "counter", "duration"]).default("daily"),
  selectedDays: z.array(z.string()).min(1, "Selecione pelo menos um dia"),
  time: z.string().default("08:00"),
  reminder: z.boolean().default(true),
  color: z.string().default("#00ff88"),
})

type HabitSchemaType = z.infer<typeof habitSchema>

interface HabitWizardProps {
  onBack: () => void
  onComplete: () => void
}

export function HabitWizard({ onBack, onComplete }: HabitWizardProps) {
  const [step, setStep] = useState(1)
  const { playSound } = useSoundContext()
  const queryClient = useQueryClient()
  const totalSteps = 6

  // --- FORM ---
  const form = useForm<HabitSchemaType>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      emoji: "🔥",
      type: "daily",
      selectedDays: ["seg", "ter", "qua", "qui", "sex"],
      time: "08:00",
      reminder: true,
      color: "#00ff88",
    }
  })

  const { control, watch, setValue, handleSubmit, formState: { isSubmitting } } = form
  const values = watch()

  // --- MUTATION ---
  const { mutate } = useMutation({
    mutationFn: async (data: HabitSchemaType) => {
      // Substitua pela sua Server Action: await createHabit(data)
      console.log("Criando hábito:", data)
      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success("Hábito criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      onComplete()
    },
    onError: () => toast.error("Erro ao criar hábito")
  })

  // --- HANDLERS ---
  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    
    let isValid = false
    if (step === 1) isValid = await form.trigger(["name"])
    else if (step === 3) isValid = await form.trigger(["selectedDays"])
    else isValid = true

    if (isValid && step < totalSteps) {
      if (step === 5) playSound("success")
      setStep(step + 1)
    }
  }

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (step === 1) onBack()
    else setStep(step - 1)
  }

  const toggleDay = (day: string) => {
    playSound("click")
    const current = values.selectedDays
    const updated = current.includes(day) 
      ? current.filter(d => d !== day) 
      : [...current, day]
    setValue("selectedDays", updated, { shouldValidate: true })
  }

  const quickSelectDays = (e: React.MouseEvent, days: string[]) => {
    e.preventDefault()
    playSound("click")
    setValue("selectedDays", days, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="h-full">
        <WizardBase
          title="Criar Hábito"
          subtitle={`${values.emoji} ${values.name || "Novo hábito"}`}
          icon={<Flame className="w-5 h-5 text-white" />}
          iconColor="bg-gradient-to-br from-orange-500 to-red-500"
          currentStep={step}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={step === totalSteps ? handleSubmit((data) => mutate(data)) : handleNext}
          onComplete={handleSubmit((data) => mutate(data))}
          canProceed={true} 
          isLastStep={step === totalSteps}
          isAIStep={step === 6}
        >
          {/* STEP 1: NOME E EMOJI */}
          {step === 1 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Qual hábito você quer criar?</h3>
                <p className="text-sm text-muted-foreground">Dê um nome e escolha um emoji</p>
              </div>
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Hábito</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Meditar 10 minutos" onFocus={() => playSound("hover")} />
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

          {/* STEP 2: TIPO */}
          {step === 2 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Qual o tipo do hábito?</h3>
              </div>
              <div className="space-y-3">
                <OptionButton
                  selected={values.type === "daily"}
                  onClick={() => { playSound("click"); setValue("type", "daily"); }}
                  icon={<Repeat className="w-5 h-5" />}
                  label="Diário"
                  description="Marque como completo uma vez por dia"
                />
                <OptionButton
                  selected={values.type === "counter"}
                  onClick={() => { playSound("click"); setValue("type", "counter"); }}
                  icon={<Clock className="w-5 h-5" />}
                  label="Contador"
                  description="Conte quantas vezes fez no dia"
                />
                <OptionButton
                  selected={values.type === "duration"}
                  onClick={() => { playSound("click"); setValue("type", "duration"); }}
                  icon={<Timer className="w-5 h-5" />}
                  label="Duração"
                  description="Registre por quanto tempo praticou"
                />
              </div>
            </StepCard>
          )}

          {/* STEP 3: DIAS */}
          {step === 3 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Em quais dias?</h3>
              </div>
              <div className="space-y-6">
                <DaySelector selectedDays={values.selectedDays} onToggleDay={toggleDay} />
                <div className="flex gap-2 justify-center">
                  {[
                    { label: "Dias úteis", days: ["seg", "ter", "qua", "qui", "sex"] },
                    { label: "Todos os dias", days: ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] },
                    { label: "Fim de semana", days: ["dom", "sab"] }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={(e) => quickSelectDays(e, preset.days)}
                      className="px-3 py-1 text-xs rounded-sm border border-border/30 hover:border-primary/50 transition-all"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* STEP 4: HORÁRIO */}
          {step === 4 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Horário e Lembrete</h3>
              </div>
              <div className="space-y-6">
                <FormField
                  control={control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário Preferido</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="text-center text-2xl font-mono h-16" onFocus={() => playSound("hover")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between p-4 bg-card/30 rounded-sm border border-border/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Ativar lembrete</p>
                      <p className="text-xs text-muted-foreground">Notificações inteligentes</p>
                    </div>
                  </div>
                  <Switch 
                    checked={values.reminder} 
                    onCheckedChange={(checked) => { playSound("click"); setValue("reminder", checked); }} 
                  />
                </div>
              </div>
            </StepCard>
          )}

          {/* STEP 5: COR E PREVIEW */}
          {step === 5 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Personalização</h3>
              </div>
              <div className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { playSound("click"); setValue("color", c); }}
                      className={`w-12 h-12 rounded-sm border-2 transition-all ${values.color === c ? "border-white scale-110 shadow-lg" : "border-transparent"}`}
                      style={{ backgroundColor: c, boxShadow: values.color === c ? `0 0 20px ${c}` : 'none' }}
                    />
                  ))}
                </div>
                <div className="p-4 bg-card/30 rounded-sm border-2" style={{ borderColor: values.color, backgroundColor: `${values.color}10` }}>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{values.emoji}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold">{values.name || "Seu Hábito"}</p>
                      <p className="text-xs text-muted-foreground">
                        {values.type} • {values.selectedDays.length} dias • {values.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </StepCard>
          )}

          {/* STEP 6: AI */}
          {step === 6 && (
            <AIInsightCard
              title="Análise da IA"
              insights={[
                `Hábito "${values.name}" configurado.`,
                `${values.selectedDays.length}x por semana cria uma rotina consistente.`,
                "Foco nos primeiros 21 dias para consolidação.",
              ]}
              motivationalMessage={isSubmitting ? "Criando hábito..." : "Pronto para começar?"}
            />
          )}
        </WizardBase>
      </form>
    </Form>
  )
}