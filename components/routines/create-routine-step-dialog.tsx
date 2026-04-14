"use client"

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from "date-fns"
import { motion, AnimatePresence } from 'framer-motion'
import { EmojiPicker } from "frimousse"

import { 
  PlusSquare, CalendarIcon, CircleOff, ChevronRight, 
  ChevronLeft, Sparkles, CheckCircle2 
} from 'lucide-react'

import { createRoutine } from '@/services/routines'
import { WEEKDAYS } from '@/lib/habit-utils'
import { cn } from '@/lib/utils'
import type { CreateRoutineSchemaType } from '@/lib/schema/routine'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import MultiHabitsTasksPicker from '@/components/multi-habit-task-picker'
import { AICreator } from '../tasks/ai-creator'

interface CreateRoutineDialogProps {
  trigger?: React.ReactNode
}

const CreateRoutineStepDialog: React.FC<CreateRoutineDialogProps> = ({ trigger }) => {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const form = useForm<CreateRoutineSchemaType>({
    defaultValues: {
      name: "",
      description: "",
      emoji: "",
      frequency: [],
      dateRange: { from: today },
      habits: [],
      tasks: [],
    }
  })

  const { control, handleSubmit, watch, reset, formState: { isSubmitting } } = form

  const { mutate, isPending } = useMutation({
    mutationFn: (values: CreateRoutineSchemaType) => createRoutine(values),
    onSuccess: async () => {
      toast.success("Rotina integrada ao sistema! 🚀")
      reset()
      setStep(1)
      setOpen(false)
      await queryClient.invalidateQueries({ queryKey: ["routines"] })
    },
    onError: () => toast.error("Falha na sincronização da rotina")
  })

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  const onSubmit = (values: CreateRoutineSchemaType) => {
    toast.loading("Sincronizando dados...", { id: "create-routine" })
    mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { setStep(1); reset(); } }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'>
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar novo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-[#070B14]/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.2)] text-white overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-linear-to-r from-blue-600 to-purple-500"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
            {step === 1 && "Identidade da Rotina"}
            {step === 2 && "Cronograma Espacial"}
            {step === 3 && "Vínculos e Hábitos"}
          </DialogTitle>
          <DialogDescription className="text-blue-100/40">
            Passo {step} de 3 — Configure os parâmetros da sua nova rotina.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-4 min-h-80">
            <AnimatePresence mode="wait">
              {/* STEP 1: INFOS BÁSICAS */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-4 items-start">
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
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="text-xs uppercase tracking-widest text-blue-400/60 font-bold">
                            Nome
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Manhã de Foco"
                              className="h-16 bg-black/40 border-white/10 focus:border-blue-500/50 text-lg"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs uppercase tracking-widest text-blue-400/60 font-bold">Descrição</Label>
                      <AICreator 
                        reference={watch("name")} 
                        type="routine" 
                        onGenerated={(text: string) => form.setValue("description", text)} 
                      />
                    </div>
                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <Textarea {...field} className="bg-black/40 border-white/10 min-h-25 resize-none focus:border-blue-500/50" placeholder="O que acontece nessa rotina?" />
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: TEMPO E FREQUÊNCIA */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-blue-400/60 font-bold flex items-center gap-2">
                      <CalendarIcon className="w-3 h-3" /> Intervalo de Atuação
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full h-14 bg-black/40 border-white/10 justify-start font-normal hover:bg-black/60">
                          <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                          {watch('dateRange')?.from ? (
                            watch('dateRange')?.to ? (
                              `${format(watch('dateRange').from, "dd MMM")} - ${format(watch('dateRange').to!, "dd MMM")}`
                            ) : format(watch('dateRange').from, "dd MMM yyyy")
                          ) : "Definir período"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#0D121F] border-white/10" align="center">
                        <Controller
                          name="dateRange"
                          control={control}
                          render={({ field }) => (
                            <Calendar mode="range" selected={field.value} onSelect={field.onChange} initialFocus className="text-white" />
                          )}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-blue-400/60 font-bold">Frequência Semanal</Label>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <ToggleGroup type="multiple" value={field.value} onValueChange={field.onChange} className="grid grid-cols-7 gap-1">
                          {WEEKDAYS.map((day) => (
                            <ToggleGroupItem 
                              key={day.key} 
                              value={day.label} 
                              className="h-12 border border-white/5 bg-white/5 data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                            >
                              {day.keyPtBr}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      )}
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3: VÍNCULOS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
                    <Sparkles className="text-blue-400 w-5 h-5" />
                    <p className="text-sm text-blue-100/70">Vincule os hábitos e tarefas que compõem este bloco de tempo.</p>
                  </div>
                  <MultiHabitsTasksPicker control={control} />
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>

        <DialogFooter className="flex flex-row items-center justify-between gap-2 mt-6">
          <div className="flex gap-2">
            {step > 1 && (
              <Button type="button" variant="ghost" onClick={prevStep} className="text-white/40 hover:text-white hover:bg-white/5">
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={nextStep} 
                disabled={!watch("name")}
                className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
              >
                Próximo <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit(onSubmit)} 
                disabled={isSubmitting || isPending}
                className="bg-linear-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-xl shadow-blue-600/20 px-8"
              >
                {isPending ? "Criando..." : "Finalizar Rotina"}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateRoutineStepDialog