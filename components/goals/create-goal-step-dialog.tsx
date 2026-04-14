"use client"

import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { EmojiPicker } from "frimousse"
import { 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  CircleOff, 
  PlusSquare,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AICreator } from '@/components/tasks/ai-creator'
import { Progress } from "@/components/ui/progress"

import type { CreateGoalSchemaType } from '@/lib/schema/goal'

interface CreateGoalStepDialogProps {
  trigger?: React.ReactNode
}

const CreateGoalStepDialog: React.FC<CreateGoalStepDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const totalSteps = 3

  const queryClient = useQueryClient()
  
  const form = useForm<CreateGoalSchemaType>({
    defaultValues: {
      name: "",
      description: "",
      emoji: "🎯",
      status: "ACTIVE",
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateGoalSchemaType) => {
      return await axios.post(`/api/goals`, values)
    },
    onSuccess: async () => {
      toast.success("Objetivo sincronizado com o sistema! ⚡")
      await queryClient.invalidateQueries({ queryKey: ["goals"] })
      handleClose()
    },
    onError: (error: any) => {
      toast.error(`Falha na sincronização: ${error.message}`)
    }
  })

  const handleClose = () => {
    setOpen(false)
    setStep(1)
    form.reset()
  }

  const nextStep = () => {
    if (step === 1 && !form.getValues("name")) {
      return toast.error("Dê um nome ao seu objetivo primeiro.")
    }
    setStep(s => Math.min(s + 1, totalSteps))
  }

  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const onSubmit = (values: CreateGoalSchemaType) => {
    mutate(values)
  }

  // Variantes de animação para os steps
  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 50 : -50, opacity: 0 })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val ? handleClose() : setOpen(true)}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20">
            <PlusSquare className="h-4 w-4" />
            Novo Objetivo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-112.5 overflow-hidden bg-[#0a0a0c] border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
             <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                <Target size={20} />
             </div>
             <div>
                <DialogTitle>Setup de Objetivo</DialogTitle>
                <DialogDescription className="text-white/40">Step {step} de {totalSteps}</DialogDescription>
             </div>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-1 bg-white/5" />
        </DialogHeader>

        <Form {...form}>
          <form className="mt-6 min-h-70 flex flex-col justify-between">
            <div className="relative overflow-hidden flex-1">
              <AnimatePresence mode="wait" custom={step}>
                <motion.div
                  key={step}
                  custom={step}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* STEP 1: IDENTIDADE */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-purple-400">Nome do Objetivo</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ex: Masterizar React" 
                                className="bg-white/5 border-white/10 focus:border-purple-500 h-12"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="emoji"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ícone Representativo</FormLabel>
                            <FormControl>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Card className="flex items-center justify-center p-4 cursor-pointer bg-white/5 border-white/10 hover:border-purple-500/50 transition-all">
                                    <span className="text-4xl">{field.value || "🎯"}</span>
                                  </Card>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 border-none bg-transparent">
                                  <EmojiPicker.Root onEmojiSelect={(e: any) => field.onChange(e.emoji)}>
                                    <EmojiPicker.Search className="bg-[#1a1a1e] border-white/10" />
                                    <EmojiPicker.Viewport className="h-60 bg-[#1a1a1e]">
                                      <EmojiPicker.List />
                                    </EmojiPicker.Viewport>
                                  </EmojiPicker.Root>
                                </PopoverContent>
                              </Popover>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 2: DETALHAMENTO COM AI */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-purple-400">Descrição Estratégica</FormLabel>
                        <AICreator
                          reference={form.watch("name")}
                          type="goal"
                          onGenerated={(text) => form.setValue("description", text)}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Descreva o impacto desta meta na sua vida..." 
                                className="bg-white/5 border-white/10 min-h-[150px] focus:border-purple-500"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* STEP 3: REVISÃO FINAL */}
                  {step === 3 && (
                    <div className="space-y-6 flex flex-col items-center justify-center py-4">
                      <div className="size-20 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                        <span className="text-4xl">{form.watch("emoji")}</span>
                      </div>
                      <div className="text-center">
                        <h4 className="text-xl font-bold">{form.watch("name")}</h4>
                        <p className="text-sm text-white/50 px-6 mt-2 line-clamp-3 italic">
                          "{form.watch("description") || "Sem descrição definida"}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                        <Sparkles size={12} />
                        Pronto para inicializar
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* CONTROLES DE NAVEGAÇÃO */}
            <div className="flex gap-2 mt-8">
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={prevStep}
                  className="hover:bg-white/5"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              )}
              
              {step < totalSteps ? (
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="flex-1 bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                >
                  Continuar <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  disabled={isPending}
                  onClick={form.handleSubmit(onSubmit)}
                  className="flex-1 bg-green-600 hover:bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                >
                  {isPending ? "Sincronizando..." : "Confirmar Objetivo"} 
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGoalStepDialog