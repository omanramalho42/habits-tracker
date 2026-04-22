"use client"

import { useCallback, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { HexColorPicker } from "react-colorful"
import { toast } from 'sonner'
import { EmojiPicker } from "frimousse"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CircleOff, 
  PlusSquare, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Target, 
  Tag, 
  Settings2 
} from "lucide-react"

import { CreateHabitSchemaType } from "@/lib/schema/habit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import GoalPicker from "@/components/goal-picker"
import CategoriePicker from "@/components/categorie-picker"

const STEPS = [
  { id: 1, title: "Identidade", icon: <PlusSquare className="w-4 h-4" /> },
  { id: 2, title: "Conexões", icon: <Target className="w-4 h-4" /> },
  { id: 3, title: "Métricas", icon: <Settings2 className="w-4 h-4" /> },
]

export function CreateHabitStepDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const form = useForm<CreateHabitSchemaType>({
    defaultValues: {
      name: "",
      goals: "",
      categories: "",
      clock: "",
      frequency: ["S", "M", "T", "W", "TH", "F", "SA"],
      color: "#8b5cf6", // Roxo padrão (Lab Habit style)
      emoji: "",
      limitCounter: 1,
      custom_field: "",
      duration: "",
      endDate: null,
      reminder: false,
      startDate: today
    }
  })

  const { control, handleSubmit, watch, reset, formState: { errors } } = form
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateHabitSchemaType) => {
      return await axios.post(`/api/habits`, values)
    },
    onSuccess: async () => {
      toast.success("Hábito forjado com sucesso! 🚀")
      reset()
      setStep(1)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ["habits"] })
      queryClient.invalidateQueries({ queryKey: ["routines"] })
    },
    onError: () => toast.error("Erro ao criar hábito")
  })

  const onSubmit = (values: CreateHabitSchemaType) => mutate(values)

  const nextStep = async () => {
    // Validação básica por step
    if (step === 1) {
      const isValid = await form.trigger(["name", "emoji", "color"])
      if (!isValid) return
    }
    if (step < STEPS.length) setStep(s => s + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) setStep(1); }}>
      <DialogTrigger asChild>
        {trigger || <Button>Criar Hábito</Button>}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-purple-500/20 shadow-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  step >= s.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.icon}
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold">{s.title}</span>
              </div>
            ))}
          </div>
          <DialogTitle className="text-xl font-bold">
            Novo hábito: <span style={{ color: watch('color') }}>{watch('name') || "..."}</span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-4 min-h-75 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-4">
                    {/* NOME E EMOJI EM LINHA */}
                    <div className="flex gap-3 items-end">
                      <FormField
                        control={control}
                        name="emoji"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ícone</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-14 h-14 p-0 text-2xl bg-muted/30 border-dashed border-2 hover:border-primary transition-all"
                                >
                                  {field.value || <PlusSquare className="w-5 h-5 opacity-40" />}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent side="bottom" align="start" className="p-0 border-none shadow-2xl">
                                <EmojiPicker.Root onEmojiSelect={(e: any) => field.onChange(e.emoji)}>
                                  <EmojiPicker.Search />
                                  <EmojiPicker.Viewport className="h-64">
                                    <EmojiPicker.List />
                                  </EmojiPicker.Viewport>
                                </EmojiPicker.Root>
                              </PopoverContent>
                            </Popover>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Nome do Hábito</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Ex: Meditação" 
                                className="h-14 text-lg bg-muted/20 focus-visible:ring-purple-500"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* SELEÇÃO DE COR OTIMIZADA */}
                    <div className="space-y-3">
                      <FormLabel>Identidade Visual</FormLabel>
                      <div className="grid grid-cols-6 gap-2">
                        {/* Presets de cores (Paleta Lab Habit) */}
                        {["#A855F7", "#EC4899", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => form.setValue("color", preset)}
                            className={`h-10 rounded-lg transition-all transform hover:scale-110 ${
                              watch("color") === preset ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-105" : "opacity-70 hover:opacity-100"
                            }`}
                            style={{ backgroundColor: preset }}
                          />
                        ))}
                        
                        {/* Custom Color Trigger */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className={`h-10 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                                !["#A855F7", "#EC4899", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B"].includes(watch("color")) 
                                ? "border-primary bg-muted" 
                                : "border-muted-foreground/30"
                              }`}
                              style={{ color: watch("color") }}
                            >
                              <Settings2 className="w-5 h-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-3 bg-popover border-purple-500/20">
                            <FormField
                              name="color"
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  <HexColorPicker color={field.value} onChange={field.onChange} />
                                  <Input 
                                    value={field.value} 
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="h-8 text-xs font-mono uppercase text-center"
                                  />
                                </div>
                              )}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Target className="w-4 h-4" /> Objetivo</Label>
                    <GoalPicker control={control} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Categoria</Label>
                    <CategoriePicker control={control} />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      name="custom_field"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade</FormLabel>
                          <Input {...field} placeholder="Páginas, Km, etc" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="limitCounter"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Diária</FormLabel>
                          <Input {...field} type="number" onChange={e => field.onChange(Number(e.target.value))} />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                    Dica: Definir uma métrica ajuda o <b>Lab Habit</b> a gerar insights sobre seu progresso real.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between gap-3 mt-8 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={step === 1 ? () => setOpen(false) : prevStep}
              >
                {step === 1 ? "Cancelar" : <><ChevronLeft className="mr-2 w-4 h-4" /> Voltar</>}
              </Button>

              {step < STEPS.length ? (
                <Button type="button" onClick={nextStep} className="bg-primary text-white">
                  Próximo <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  type="button" 
                  disabled={isPending} 
                  onClick={handleSubmit(onSubmit)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isPending ? "Criando..." : "Finalizar Habit"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}