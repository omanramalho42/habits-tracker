"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
  Plus, 
  Layers, 
  Target, 
  Zap, 
  BarChart, 
  Tag,
  Rocket,
  ArrowRight
} from "lucide-react"

import { 
  WizardBase, 
  StepCard, 
  OptionButton,
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"
import { toast } from "sonner"

// --- SCHEMA ROBUSTO PARA RELAÇÕES ---
const dynamicEntitySchema = z.object({
  // Task Core
  name: z.string().min(2, "Nome é essencial"),
  description: z.string().optional(),
  
  // Relação: Category
  categoryName: z.string().min(1, "Selecione ou crie uma categoria"),
  
  // Relação: Goal (Opcional)
  goalId: z.string().optional(),
  
  // Relação: TaskMetric (Dinâmica)
  hasMetric: z.boolean().default(false),
  metric: z.object({
    field: z.string().optional(),
    unit: z.string().optional(),
    fieldType: z.enum(["NUMERIC", "STRING", "FLOAT"]).default("NUMERIC"),
  }).optional(),

  // Relação: Counter (Configuração de limites)
  hasCounter: z.boolean().default(false),
  counter: z.object({
    label: z.string().optional(),
    limit: z.coerce.number().default(1),
  }).optional()
})

type EntityFormData = z.infer<typeof dynamicEntitySchema>

export function FullEntityWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1)
  const { playSound } = useSoundContext()
  const totalSteps = 5

  const methods = useForm<EntityFormData>({
    resolver: zodResolver(dynamicEntitySchema),
    defaultValues: {
      name: "",
      hasMetric: false,
      hasCounter: false,
      categoryName: "Geral",
      metric: { fieldType: "NUMERIC" }
    }
  })

  const { watch, setValue, handleSubmit, trigger } = methods
  const values = watch()

  // --- LÓGICA DE PERSISTÊNCIA (PRISMA NESTED WRITES) ---
  const onSubmit = async (data: EntityFormData) => {
    try {
      // Simulação da estrutura que o Prisma receberia no Backend:
      const prismaPayload = {
        name: data.name,
        description: data.description,
        categories: {
          connectOrCreate: {
            where: { name: data.categoryName },
            create: { name: data.categoryName, userId: "current-user" }
          }
        },
        metrics: data.hasMetric ? {
          create: {
            field: data.metric?.field,
            unit: data.metric?.unit,
            fieldType: data.metric?.fieldType
          }
        } : undefined,
        counter: data.hasCounter ? {
          create: {
            label: data.counter?.label || data.name,
            limit: data.counter?.limit
          }
        } : undefined
      }

      console.log("Payload para Prisma:", prismaPayload)
      playSound("success")
      toast.success("Arquitetura de dados criada e conectada!")
      onComplete()
    } catch (error) {
      toast.error("Falha ao sincronizar tabelas")
    }
  }

  const handleNext = async () => {
    let fieldsToValidate: any[] = []
    if (step === 1) fieldsToValidate = ["name"]
    if (step === 3 && values.hasMetric) fieldsToValidate = ["metric.field"]
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(prev => prev + 1)
      playSound("click")
    }
  }

  return (
    <FormProvider {...methods}>
      <WizardBase
        title="Arquiteto de Tarefas"
        subtitle={values.name || "Configurando Fluxo"}
        icon={<Layers className="w-5 h-5" />}
        iconColor="bg-indigo-600"
        currentStep={step}
        totalSteps={totalSteps}
        onBack={() => setStep(s => s - 1)}
        onNext={step === totalSteps ? handleSubmit(onSubmit) : handleNext}
        isLastStep={step === totalSteps}
        isAIStep={step === 5}
        onComplete={() => {window.alert("sucesso")}}
      >
        {/* STEP 1: ENTIDADE CORE */}
        {step === 1 && (
          <StepCard>
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Rocket className="text-primary w-5 h-5" /> Definição da Task
              </h3>
              <div className="space-y-2">
                <Label>Nome Principal</Label>
                <Input {...methods.register("name")} placeholder="Ex: Treino de Hypertrofia" />
              </div>
              <div className="space-y-2">
                <Label>Contexto (Categoria)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["Saúde", "Trabalho", "Estudo"].map(cat => (
                    <OptionButton
                      key={cat}
                      selected={values.categoryName === cat}
                      label={cat}
                      onClick={() => setValue("categoryName", cat)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </StepCard>
        )}

        {/* STEP 2: CONEXÃO COM GOALS (CHECKPOINTS) */}
        {step === 2 && (
          <StepCard>
            <h3 className="text-lg font-bold mb-4">Vincular a um Objetivo?</h3>
            <div className="space-y-3">
              <OptionButton
                selected={!values.goalId}
                label="Tarefa Avulsa"
                description="Não vinculada a objetivos maiores"
                icon={<Zap />}
                onClick={() => setValue("goalId", "")}
              />
              <OptionButton
                selected={!!values.goalId}
                label="Conectar ao Checkpoint"
                description="Vincula esta task ao seu progresso trimestral"
                icon={<Target />}
                onClick={() => setValue("goalId", "goal-uuid-mock")}
              />
            </div>
          </StepCard>
        )}

        {/* STEP 3: TABELA DE MÉTRICAS (TaskMetric) */}
        {step === 3 && (
          <StepCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Métricas Dinâmicas</h3>
              <input 
                type="checkbox" 
                checked={values.hasMetric} 
                onChange={(e) => setValue("hasMetric", e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
            {values.hasMetric ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>O que medir?</Label>
                    <Input {...methods.register("metric.field")} placeholder="Ex: Carga" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade</Label>
                    <Input {...methods.register("metric.unit")} placeholder="Ex: kg" />
                  </div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  Isso criará uma relação 1:N na tabela `TaskMetric`.
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Esta tarefa será apenas do tipo binário (Check/Uncheck).</p>
            )}
          </StepCard>
        )}

        {/* STEP 4: CONTADORES (CounterStep) */}
        {step === 4 && (
          <StepCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-pink-500">Limites e Contadores</h3>
              <Plus className={`w-6 h-6 ${values.hasCounter ? 'text-pink-500' : 'text-muted'}`} />
            </div>
            <OptionButton
              selected={values.hasCounter}
              label={values.hasCounter ? "Contador Ativo" : "Ativar Contador"}
              description="Define quantas vezes isso pode ser feito por dia"
              onClick={() => setValue("hasCounter", !values.hasCounter)}
            />
            {values.hasCounter && (
              <div className="mt-4 p-4 border border-pink-500/20 bg-pink-500/5 rounded-xl">
                <Label>Meta Diária (Limit)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input 
                    type="range" min="1" max="20" 
                    value={values.counter?.limit} 
                    onChange={(e) => setValue("counter.limit", Number(e.target.value))}
                    className="flex-1 accent-pink-500"
                  />
                  <span className="font-mono font-bold text-pink-500">{values.counter?.limit}x</span>
                </div>
              </div>
            )}
          </StepCard>
        )}

        {/* STEP 5: AI ARCHITECT INSIGHT */}
        {step === 5 && (
          <AIInsightCard
            title="Sincronização de Dados"
            insights={[
              `Arquitetura pronta: 1 Task + 1 Categoria (${values.categoryName})`,
              values.hasMetric ? `Tabela TaskMetric configurada para "${values.metric?.field}"` : "Sem métricas secundárias",
              values.hasCounter ? `Contador diário ajustado para ${values.counter?.limit} execuções` : "Execução única simples",
              "Relacionamento Cascade configurado no Banco de Dados"
            ]}
            motivationalMessage="Sua estrutura de dados está otimizada para escalabilidade."
          />
        )}
      </WizardBase>
    </FormProvider>
  )
}