"use client"

import { useCallback, useState, useRef } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  useForm
} from "react-hook-form"

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
  PlusSquare
} from "lucide-react"

import type { CreateTaskSchemaType } from "@/lib/schema/task"

interface CreateTaskDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: CreateTaskSchemaType) => void
}

const CreateTaskDialog = ({ trigger }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [isCounterTask, setIsCounterTask] =
    useState<boolean>(false)
  
  const today = new Date()
  today.setHours(0,0,0,0)

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
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateTaskSchemaType) => {
      console.log(values, "values")
      return await createTask(values)
    },
    onSuccess: async () => {
      toast.success("Tarefa criada com sucesso! 🎉", {
        id: "create-task"
      })

      reset()

      await queryClient.invalidateQueries({
        queryKey: [
          "tasks"
        ]
      })
      await queryClient.invalidateQueries({
        queryKey: [
          "routines"
        ]
      })

      setOpen(prev => !prev)
    },
    onError: () => {
      toast.error("Ocorreu um erro ao criar tarefa", {
        id: "create-task",
      })
    },
  })

  const onSubmit = useCallback((values: CreateTaskSchemaType) => {
    console.log(values, 'values')
    toast.loading("Criando tarefa....", {
      id: "create-task"
    })
    // return
    mutate(values)
  },[])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-label="Criar novo"
            title="Criar novo"
            aria-expanded={open}
            disabled={isPending}
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar nova
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex flex-row items-center justify-start gap-3 text-2xl">
            <p>Criar uma nova tarefa</p>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-3">

            <div className="grid grid-cols-3 justify-start items-start gap-3">
              {/* ICONE */}
              <div className="flex flex-col">
                <FormField
                  control={control}
                  name="emoji"
                  render={({ field }) => (
                    <FormItem className="grid-cols-1 gap-3">
                      <FormLabel htmlFor="icon">
                        Icone
                      </FormLabel>

                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Card
                              className="w-full h-full"
                            >
                              {field.value ? (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <span className="text-3xl" role="img">
                                    {field.value}
                                  </span>
                                  <p className="text-xs text-center text-muted-foreground">
                                    Toque para trocar
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-1">
                                  <CircleOff className="h-6 w-6 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground text-center">
                                    Toque para selecionar
                                  </p>
                                </div>
                              )}
                            </Card>
                          </PopoverTrigger>

                          <PopoverContent
                            side="right"
                            align="start"
                            className="
                              scroll-container
                              w-full
                              p-3
                              max-h-[70vh]
                              max-w-[60vw]
                              sm:max-w-full
                              overflow-y-visible
                            "
                          >
                            <EmojiPicker.Root
                              className="flex flex-col gap-2"
                              onEmojiSelect={(emoji: any) => {
                                field.onChange(emoji.emoji)
                              }}
                            >
                              <EmojiPicker.Search className="w-full" />

                              <EmojiPicker.Viewport
                                className="h-[50vh] overflow-y-visisble"
                                style={{
                                  WebkitOverflowScrolling: "touch"
                                }}
                                onWheel={(e) => e.stopPropagation()}
                              >
                                <EmojiPicker.Loading>
                                  Carregando…
                                </EmojiPicker.Loading>

                                <EmojiPicker.Empty>
                                  Nenhum emoji encontrado
                                </EmojiPicker.Empty>

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
              
              <div className="w-full col-span-2 flex flex-col gap-3 justify-start items-start">
                <FormField
                  name="name"
                  rules={{ required: true, min: 5 }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>
                        <Label
                          htmlFor="name"
                          className="text-sm font-semibold"
                        >
                          Nome da tarefa
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id="name"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Anotar atividade de sala.."
                          className="truncate"
                        />
                      </FormControl>
                      {errors.name && (
                        <span className="text-sm text-red-500">
                          {errors.name?.message}
                        </span>
                      )}
                    </FormItem>
                  )}
                />
                
                {/* GOALS */}
                <div className="flex flex-col gap-2 w-full">
                  <Label htmlFor="goal" className="text-sm font-medium">
                    Vincular Objetivo
                  </Label>
                  <GoalPicker
                    control={control}
                  />
                </div>

              </div>
            </div>

            <div className="flex flex-col gap-2 w-full mt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Descrição
                </Label>

                <AICreator
                  reference={form.watch("name")}
                  type="task" 
                  onGenerated={
                    (text) => form.setValue("description", text)
                  } 
                />
              </div>

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        id="description"
                        className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Detalhes sobre sua nova rotina..."
                      />
                    </FormControl>
                    {errors && errors.description && (
                      <span className='text-red-500 text-sm'>
                        {errors.description.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
            </div>

            {/* <div className="flex justify-between gap-4 items-center">
              <FormField
                name="custom_field"
                rules={{ max: 12 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        className="text-sm font-semibold"
                        htmlFor="custom_field"
                      >
                        Nome do contador
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="custom_field"
                        placeholder="ex: Páginas..."
                        onChange={field.onChange}
                        type="text"
                      />
                    </FormControl>
                    {errors.custom_field && (
                      <span className="text-sm text-red-500">
                        {errors.custom_field.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                name="limitCounter"
                control={control}
                rules={{ min: 1, max: 10 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Label
                        htmlFor="counter"
                        className="text-sm font-semibold"
                      >
                        Quantidade max
                      </Label>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="limitCounter"
                        value={field.value}
                        onChange={field.onChange}
                        type="number"
                      />
                    </FormControl>
                    {errors.limitCounter && (
                      <span className="text-sm text-red-500">
                        {errors.limitCounter?.message}
                      </span>
                    )}
                  </FormItem>
                )}
              />
            </div> */}

            {/* <p className="text-sm truncate tracking-tighter">
              Anexe imagens, video, arquivos para sua tarefa
            </p> */}
            <div className="grid grid-cols-2 gap-2">
              {/* VIDEO */}
              <FormField
                control={control}
                name="imageUrl"
                render={({ field }) => {
                  const inputRef = useRef<HTMLInputElement | null>(null)

                  return (
                    <FormItem>
                      <FormControl>
                        <div className="cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*"
                            ref={inputRef}
                            hidden
                            onChange={(e) => {
                              // console.log(e.target.files?.[0],"files")
                              const file = e.target.files?.[0]
                              if (!file) return

                              const url = URL.createObjectURL(file)
                              field.onChange(file)
                            }}
                          />
                          <Card 
                            className="p-3 flex flex-col items-center justify-center text-xs"
                            onClick={() => inputRef.current?.click()}
                          >
                            📷 Imagem
                            {field.value !== null && (
                              <span className="text-green-500 mt-1">Selecionado</span>
                            )}
                          </Card>
                        </div>
                      </FormControl>
                    </FormItem>
                  )
                }}
              />

              {/* VIDEO */}
              <FormField
                control={control}
                name="videoUrl"
                render={({ field }) => {
                  const inputRef = useRef<HTMLInputElement | null>(null)

                  return (
                    <FormItem>
                      <FormControl>
                        <div className="cursor-pointer">
                          <Input
                            type="file"
                            accept="video/*"
                            ref={inputRef}
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return

                              const url = URL.createObjectURL(file)
                              field.onChange(file)
                            }}
                          />
                          <Card 
                            className="p-3 flex flex-col items-center justify-center text-xs"
                            onClick={() => inputRef.current?.click()}
                          >
                            🎬 Video
                            {field.value !== null && (
                              <span className="text-green-500 mt-1">Selecionado</span>
                            )}
                          </Card>
                        </div>
                      </FormControl>
                    </FormItem>
                  )
                }}
              />

              {/* AUDIO */}
              {/* <FormField
                control={control}
                name="audioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="audio/*"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const url = URL.createObjectURL(file)
                            field.onChange(url)
                          }}
                        />
                        <Card className="p-3 flex flex-col items-center justify-center text-xs">
                          🎧 Audio
                          {field.value && (
                            <span className="text-green-500 mt-1">Selecionado</span>
                          )}
                        </Card>
                      </label>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="fileUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          hidden
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const url = URL.createObjectURL(file)
                            field.onChange(url)
                          }}
                        />
                        <Card className="p-3 flex flex-col items-center justify-center text-xs">
                          📄 File
                          {field.value && (
                            <span className="text-green-500 mt-1">Selecionado</span>
                          )}
                        </Card>
                      </label>
                    </FormControl>
                  </FormItem>
                )}
              /> */}
            </div>

            {/* SWITCHES */}
            <FieldGroup>
              <FieldLabel>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Simples</FieldTitle>
                    <FieldDescription>Apenas completo</FieldDescription>
                  </FieldContent>

                  <Switch
                    checked={!isCounterTask}
                    onCheckedChange={() => setIsCounterTask(prev => !prev)}
                  />
                </Field>
              </FieldLabel>

              <FieldLabel>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Com métricas</FieldTitle>
                    <FieldDescription>Contadores customizados</FieldDescription>
                  </FieldContent>

                  <Switch
                    checked={isCounterTask}
                    onCheckedChange={() => setIsCounterTask(prev => !prev)}
                  />
                </Field>
              </FieldLabel>
            </FieldGroup>

            {isCounterTask && (
              <div className="transition-all">
                <CounterPicker
                  control={control}
                />
              </div>
            )}

            {/* COLOR PICKER */}
            {/* <Dialog open={color} onOpenChange={setColor}>
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  variant="outline"
                >
                  Selecione a cor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle>Selecione a cor</DialogTitle>
                  <DialogDescription>
                    Selecione a cor movendo o ponteiro em cima da cor desejada
                    em baixo selecione a tonalidade para te auxiliar
                  </DialogDescription>
                </DialogHeader>
                <div className="flex w-full justify-center items-center">
                  <Controller
                    name="color"
                    render={({ field }) => (
                      <HexColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={() => setColor((prev) => !prev)}
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
             */}

            <DialogFooter className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen
                  }}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 shadow-md"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Criando..." : "Criar tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskDialog