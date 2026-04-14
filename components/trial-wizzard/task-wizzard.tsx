"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"
import { toast } from "sonner"
import { CheckSquare, FileText, Repeat, BarChart3, Clock, Sparkles } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  WizardBase, 
  StepCard, 
  OptionButton,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

// --- SCHEMA ---
const taskSchema = z.object({
  name: z.string().min(1, "O nome da tarefa é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["simple", "recurring", "metric"]).default("simple"),
  duration: z.string().default("30"),
  metricName: z.string().optional(),
  metricUnit: z.string().optional(),
  category: z.string().default("Pessoal"),
})

type TaskSchemaType = z.infer<typeof taskSchema>

interface TaskWizardProps {
  onBack: () => void
  onComplete: () => void
}

export function TaskWizard({ onBack, onComplete }: TaskWizardProps) {
  const [step, setStep] = useState(1)
  const { playSound } = useSoundContext()
  const queryClient = useQueryClient()
  const totalSteps = 5

  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "simple",
      duration: "30",
      metricName: "",
      metricUnit: "",
      category: "Pessoal",
    }
  })

  const { control, watch, setValue, handleSubmit, formState: { isSubmitting } } = form
  const values = watch()

  // --- MUTATION ---
  const { mutate } = useMutation({
    mutationFn: async (data: TaskSchemaType) => {
      // await createTask(data)
      console.log("Tarefa criada:", data)
      return new Promise((res) => setTimeout(res, 800))
    },
    onSuccess: () => {
      toast.success("Tarefa criada com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
      onComplete()
    },
    onError: () => toast.error("Erro ao criar tarefa")
  })

  // --- HANDLERS ---
  const handleNext = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    let isValid = false
    
    if (step === 1) isValid = await form.trigger(["name"])
    else if (step === 4 && values.type === "metric") isValid = await form.trigger(["metricName"])
    else isValid = true

    if (isValid && step < totalSteps) {
      if (step === 4) playSound("success")
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
          title="Criar Tarefa"
          subtitle={values.name || "Nova tarefa"}
          icon={<CheckSquare className="w-5 h-5 text-white" />}
          iconColor="bg-gradient-to-br from-blue-500 to-cyan-500"
          currentStep={step}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={step === totalSteps ? handleSubmit((data) => mutate(data)) : handleNext}
          onComplete={handleSubmit((data) => mutate(data))}
          canProceed={true}
          isLastStep={step === totalSteps}
          isAIStep={step === 5}
        >
          {/* STEP 1: BÁSICO */}
          {step === 1 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Descreva sua tarefa</h3>
              </div>
              <div className="space-y-4">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Tarefa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Estudar para prova" onFocus={() => playSound("hover")} />
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
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Detalhes..." className="min-h-[100px]" onFocus={() => playSound("hover")} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </StepCard>
          )}

          {/* STEP 2: TIPO */}
          {step === 2 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Tipo de tarefa</h3>
              </div>
              <div className="space-y-3">
                <OptionButton
                  selected={values.type === "simple"}
                  onClick={() => { playSound("click"); setValue("type", "simple"); }}
                  icon={<FileText className="w-5 h-5" />}
                  label="Simples"
                  description="Apenas marque como concluída"
                />
                <OptionButton
                  selected={values.type === "recurring"}
                  onClick={() => { playSound("click"); setValue("type", "recurring"); }}
                  icon={<Repeat className="w-5 h-5" />}
                  label="Recorrente"
                  description="Repete em intervalos definidos"
                />
                <OptionButton
                  selected={values.type === "metric"}
                  onClick={() => { playSound("click"); setValue("type", "metric"); }}
                  icon={<BarChart3 className="w-5 h-5" />}
                  label="Com Métricas"
                  description="Registre valores (ex: páginas lidas)"
                />
              </div>
            </StepCard>
          )}

          {/* STEP 3: DURAÇÃO */}
          {step === 3 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Tempo estimado</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    value={values.duration}
                    onChange={(e) => setValue("duration", e.target.value)}
                    className="flex-1 accent-primary"
                  />
                  <div className="w-20 h-12 rounded-sm border-2 border-primary bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-primary">{values.duration}</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {["15", "30", "45", "60", "90", "120"].map((d) => (
                    <button
                      key={d}
                      type="button" // CRÍTICO: Previne fechamento do Dialog
                      onClick={() => { playSound("click"); setValue("duration", d); }}
                      className={`px-4 py-2 rounded-sm border-2 font-mono text-sm transition-all ${values.duration === d ? "border-primary bg-primary/20 text-primary" : "border-border/30 hover:border-primary/50"}`}
                    >
                      {d}min
                    </button>
                  ))}
                </div>
              </div>
            </StepCard>
          )}

          {/* STEP 4: MÉTRICAS OU CATEGORIA */}
          {step === 4 && (
            <StepCard>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">
                  {values.type === "metric" ? "Configurar Métricas" : "Categoria"}
                </h3>
              </div>
              {values.type === "metric" ? (
                <div className="space-y-4 text-left">
                  <FormField
                    control={control}
                    name="metricName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Métrica</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: Páginas lidas" onFocus={() => playSound("hover")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="metricUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: pag, km, litros" onFocus={() => playSound("hover")} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {["Trabalho", "Estudos", "Saúde", "Pessoal", "Financeiro", "Outro"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { playSound("click"); setValue("category", cat); }}
                      className={`p-4 rounded-sm border-2 text-sm font-medium transition-all ${values.category === cat ? "border-primary bg-primary/20 text-primary" : "border-border/30 hover:border-primary/50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </StepCard>
          )}

          {/* STEP 5: AI INSIGHTS */}
          {step === 5 && (
            <AIInsightCard
              title="Análise da IA"
              insights={[
                `Tarefa "${values.name}" de ${values.duration}min.`,
                "Use a técnica Pomodoro para manter o foco.",
                values.type === "metric" ? `Acompanhar ${values.metricName} aumentará sua clareza de progresso.` : "Defina um horário específico para começar.",
              ]}
              motivationalMessage={isSubmitting ? "Finalizando..." : "Vamos tirar isso do papel?"}
            />
          )}
        </WizardBase>
      </form>
    </Form>
  )
}