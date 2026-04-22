"use client"

import React, { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FolderOpen, PlusSquare, CircleOff } from "lucide-react"
import { EmojiPicker } from "frimousse"

// Componentes do Wizard e Contexto
import { 
  WizardBase, 
  StepCard, 
  AIInsightCard 
} from "@/components/trial-wizzard/wizzard-base"
import { useSoundContext } from "@/components/trial-wizzard/sound-provider"

// UI Components
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'

// Actions e Schemas
import { CreateCategorie } from '@/app/habits/_actions/categories/categories'
import { CreateCategorieSchema, type CreateCategorieSchemaType } from '@/lib/schema/categorie'
import { AICreator } from '@/components/tasks/ai-creator'

interface CreateCategorieStepDialogProps {
  trigger?: React.ReactNode
}

const COLOR_OPTIONS = ["#a855f7", "#00d4ff", "#ff6b6b", "#ffd93d", "#6c5ce7", "#fd79a8", "#00b894", "#e17055"]

export function CreateCategorieStepDialog({ trigger }: CreateCategorieStepDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 4
  
  const queryClient = useQueryClient()
  const { playSound } = useSoundContext()

  const form = useForm<CreateCategorieSchemaType>({
    resolver: zodResolver(CreateCategorieSchema),
    defaultValues: {
      name: "",
      description: "",
      emoji: "📁",
      color: "#a855f7",
      status: "ACTIVE",
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateCategorieSchemaType) => {
      return await CreateCategorie(values)
    },
    onSuccess: async () => {
      toast.success("Categoria criada com sucesso! 🚀")
      await queryClient.invalidateQueries({ queryKey: ["categories"] })
      setOpen(false)
      resetWizard()
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar categoria: ${error.message}`)
    }
  })

  const resetWizard = useCallback(() => {
    setStep(1)
    form.reset()
  }, [form])

  const handleNext = async () => {
    const fieldsToValidate = step === 1 ? ['name'] : []
    const isValid = await form.trigger(fieldsToValidate as any)
    
    if (isValid && step < totalSteps) {
      if (step === 2) playSound("success") // Som ao chegar no insight ou preview
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 1) setOpen(false)
    else setStep(step - 1)
  }

  const renderStepContent = () => {
    const { watch, setValue, control } = form
    const currentName = watch("name")
    const currentEmoji = watch("emoji")
    const currentColor = watch("color")

    switch (step) {
      case 1:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Primeiros passos</h3>
              <p className="text-sm text-muted-foreground">Dê um nome e escolha um ícone para sua categoria</p>
            </div>
            
            <div className="space-y-4">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Nome da Categoria</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Saúde, Trabalho..." 
                        onFocus={() => playSound("hover")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Ícone representativo</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Card className="p-4 flex items-center justify-center cursor-pointer border-dashed hover:border-primary transition-colors">
                          {field.value ? (
                            <span className="text-4xl">{field.value}</span>
                          ) : (
                            <CircleOff className="h-8 w-8 text-muted-foreground" />
                          )}
                        </Card>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 border-none" align="center">
                        <EmojiPicker.Root onEmojiSelect={(e: any) => {
                          field.onChange(e.emoji)
                          playSound("click")
                        }}>
                          <EmojiPicker.Search />
                          <EmojiPicker.Viewport className="h-[300px]">
                            <EmojiPicker.List />
                          </EmojiPicker.Viewport>
                        </EmojiPicker.Root>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          </StepCard>
        )

      case 2:
        return (
          <StepCard>
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Personalização e IA</h3>
              <p className="text-sm text-muted-foreground">Defina a cor e uma breve descrição</p>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { playSound("click"); setValue("color", c); }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      currentColor === c ? "border-white scale-110 shadow-lg" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Descrição</Label>
                  <AICreator 
                    reference={currentName} 
                    type="category" 
                    onGenerated={(text) => setValue("description", text)} 
                  />
                </div>
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormControl>
                      <Textarea {...field} placeholder="Para que serve esta categoria?" className="min-h-[100px]" />
                    </FormControl>
                  )}
                />
              </div>
            </div>
          </StepCard>
        )

      case 3:
        return (
          <AIInsightCard
            title="Dica de Organização"
            insights={[
              `Agrupar por "${currentName}" ajuda o cérebro a focar no contexto.`,
              "Cores facilitam a navegação visual no seu Dashboard.",
              "Categorias bem definidas aumentam em 30% a adesão aos hábitos."
            ]}
            motivationalMessage="Clareza é poder!"
          />
        )

      case 4:
        return (
          <StepCard>
            <div className="text-center py-6">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl transition-all"
                style={{ backgroundColor: `${currentColor}20`, border: `2px solid ${currentColor}` }}
              >
                {currentEmoji}
              </div>
              <h3 className="text-2xl font-bold mb-1">{currentName}</h3>
              <p className="text-muted-foreground mb-4">Tudo pronto para organizar sua rotina!</p>
            </div>
          </StepCard>
        )
      default: return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if(!v) resetWizard(); setOpen(v); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20">
            <PlusSquare className="h-4 w-4" />
            Nova categoria
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-none">
        <Form {...form}>
          <WizardBase
            title="Criar Categoria"
            subtitle={form.watch("name") || "Nova Categoria"}
            icon={<FolderOpen className="w-5 h-5 text-white" />}
            iconColor="bg-gradient-to-br from-purple-500 to-pink-500"
            currentStep={step}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            onComplete={form.handleSubmit((v) => mutate(v))}
            canProceed={form.watch("name").length > 2}
            isLastStep={step === totalSteps}
            isLoading={isPending}
          >
            {renderStepContent()}
          </WizardBase>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCategorieStepDialog