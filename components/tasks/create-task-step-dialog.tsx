"use client"

import { useCallback, useState, useRef } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from 'sonner'
import { EmojiPicker } from "frimousse"

import { createTask } from "@/app/habits/_actions/task/task"

import GoalPicker from "@/components/goal-picker"
import CounterPicker from "@/components/counter/counter-picker"
import { AICreator } from "@/components/tasks/ai-creator"

import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"

import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import { Card } from "@/components/ui/card"

import {
  CircleOff,
  PlusSquare,
  ChevronRight,
  ChevronLeft
} from "lucide-react"

import type { CreateTaskSchemaType } from "@/lib/schema/task"
import CustomEmojiPicker from "../v2/emoji-picker"

interface CreateTaskStepDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: CreateTaskSchemaType) => void
}

const STEPS = ["Identificação", "Conteúdo", "Configurações"]

const CreateTaskStepDialog = ({ trigger }: CreateTaskStepDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isCounterTask, setIsCounterTask] = useState<boolean>(false)

  const form = useForm<CreateTaskSchemaType>({
    defaultValues: {
      name: "",
      color: "",
      imageUrl: null,
      videoUrl: null,
      categories: "",
      description: "",
      isPLus: true,
      goals: "",
      emoji: "",
      limitCounter: 1,
      counterId: "",
      custom_field: "",
      emojiId: undefined
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = form

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (values: CreateTaskSchemaType) => {
      console.log(values, "values!")
      return await createTask(values)
    },
    onSuccess: async () => {
      toast.success("Tarefa criada com sucesso! 🎉", {
        id: "create-task"
      })
      reset()
      setCurrentStep(0)
      await queryClient.invalidateQueries({
        queryKey: ["tasks"]
      })
      await queryClient.invalidateQueries({
        queryKey: ["routines"]
      })
      setOpen(false)
    },
    onError: () => {
      toast.error("Erro ao criar tarefa", {
        id: "create-task"
      })
    },
  })

  const onSubmit = useCallback((values: CreateTaskSchemaType) => {
    toast.loading("Criando tarefa....", {
      id: "create-task"
    })
    mutate(values)
  }, [mutate])

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (!val) setCurrentStep(0) // Reseta o step ao fechar
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar nova
          </Button>
        )}
      </DialogTrigger>

      <DialogContent 
        className="max-w-[90vw] sm:max-w-125"
        onPointerDownOutside={(e) => {
            // Se o step for o 3, evitamos fechar por cliques externos acidentais em pickers
            if (currentStep === 2) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span className="text-xl">{STEPS[currentStep]}</span>
            <div className="flex gap-1 w-full">
              {STEPS.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${idx <= currentStep ? 'bg-primary' : 'bg-muted'}`} 
                />
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4 pt-4" onSubmit={(e) => e.preventDefault()}>
            {/* STEP 1: Básico */}
            {currentStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={control}
                    name="emoji"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone</FormLabel>
                        <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Card className="w-full h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50">
                                {field.value ? (
                                  <span className="text-4xl">{field.value}</span>
                                ) : (
                                  <CircleOff className="h-8 w-8 text-muted-foreground" />
                                )}
                              </Card>
                            </PopoverTrigger>
                            <PopoverContent side="right" className="p-3 max-h-[70vh] w-[300px]">
                              <EmojiPicker.Root onEmojiSelect={(emoji: any) => field.onChange(emoji.emoji)}>
                                <EmojiPicker.Search />
                                <EmojiPicker.Viewport className="h-[40vh]">
                                  <EmojiPicker.List />
                                </EmojiPicker.Viewport>
                              </EmojiPicker.Root>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="col-span-2 space-y-4">
                    <FormField
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da tarefa</FormLabel>
                          <Input {...field} placeholder="Ex: Treino de bíceps..." />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vincular Objetivo</Label>
                      <GoalPicker control={control} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Detalhes e Mídia */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Descrição</Label>
                  <AICreator 
                    reference={watch("name")} 
                    type="task" 
                    onGenerated={(text) => setValue("description", text)} 
                  />
                </div>
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <Textarea {...field} className="min-h-24" placeholder="Detalhes da sua nova rotina..." />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FileUploadField name="imageUrl" label="📷 Imagem" accept="image/*" control={control} />
                  <FileUploadField name="videoUrl" label="🎬 Vídeo" accept="video/*" control={control} />
                </div>

                <CustomEmojiPicker control={control} />
              </div>
            )}

            {/* STEP 3: Métricas */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Tarefa Simples</p>
                      <p className="text-xs text-muted-foreground">Apenas marcação de concluído</p>
                    </div>
                    <Switch 
                      checked={!isCounterTask} 
                      onCheckedChange={() => setIsCounterTask(false)} 
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-xl bg-card">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold">Com métricas</p>
                      <p className="text-xs text-muted-foreground">Uso de contadores (ex: kg, reps)</p>
                    </div>
                    <Switch 
                      checked={isCounterTask} 
                      onCheckedChange={() => setIsCounterTask(true)} 
                    />
                  </div>
                </div>

                {isCounterTask && (
                  <div className="p-1">
                    <CounterPicker control={control} />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex flex-row gap-2 pt-6">
              {currentStep > 0 ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handlePrev} 
                  className="flex-1"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="flex-1">
                    Cancelar
                  </Button>
                </DialogClose>
              )}

              {currentStep < STEPS.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={handleNext} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  Próximo <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  disabled={isSubmitting} 
                  onClick={handleSubmit(onSubmit)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Criando..." : "Criar tarefa"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

// Sub-componente para upload de arquivos
const FileUploadField = ({ name, label, accept, control }: any) => {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Input 
            type="file" 
            accept={accept} 
            ref={inputRef} 
            className="hidden" 
            onChange={(e) => field.onChange(e.target.files?.[0])} 
          />
          <Card 
            className="p-4 flex flex-col items-center justify-center text-xs cursor-pointer hover:bg-accent border-dashed transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <span className="font-medium">{label}</span>
            {field.value && <span className="text-green-500 mt-1 font-bold animate-pulse">✓ Selecionado</span>}
          </Card>
        </FormItem>
      )}
    />
  )
}

export default CreateTaskStepDialog;