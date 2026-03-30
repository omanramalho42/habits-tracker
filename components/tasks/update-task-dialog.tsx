"use client"

import { useCallback, useRef, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Controller,
  useForm
} from "react-hook-form"

import { HexColorPicker } from "react-colorful"

import { toast } from 'sonner'

import { EmojiPicker } from "frimousse"

import CategoriePicker from "@/components/categorie-picker"
import CounterPicker from "@/components/counter/counter-picker"
import GoalPicker from "@/components/goal-picker"

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
  DialogClose,
  DialogDescription
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

import type { UpdateTaskSchemaType } from "@/lib/schema/task"
import type { Categories, Counter, Goals, Task } from "@prisma/client"
import { updateTask } from "@/app/habits/_actions/task/task"
import { uploadFile } from "@/lib/utils"
// import { uploadToCloudinary } from "@/app/habits/_actions/upload/upload-file-action"
// import { updateTask } from "@/services/tasks"

interface UpdateTaskDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: UpdateTaskSchemaType) => void
  task: Task & { goals?: Goals[], categories?: Categories[], counter?: Counter }
}

const UpdateTaskDialog = ({ trigger, task }: UpdateTaskDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [color, setColor] = useState<boolean>(false)
  const [isCounterTask, setIsCounterTask] =
    useState<boolean>(task?.counter ? true : false)

  const today = new Date()
  today.setHours(0,0,0,0)

  const goalId = task.goals?.map((goal) => goal.id)[0] || ""
  const categorieId = task.categories?.map((categorie) => categorie.id)[0] || ""
  // const startDate = new Date(task.startDate)
  // startDate.setHours(0,0,0,0)

  const form = useForm<UpdateTaskSchemaType>({
    defaultValues: {
      id: task.id,
      name: task.name,
      color: task.color || "",
      imageUrl: task.imageUrl || null,
      videoUrl: task.videoUrl || null,
      categories: categorieId,
      description: task.description || "",
      isPLus: task.isPlus || true,
      goals: goalId,
      emoji: task.emoji || "",
      limitCounter: task.limitCounter || 1,
      counterId: task.counterId || "",
    }
  })

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: {
      errors,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UpdateTaskSchemaType) => {
      console.log(values, "values ✨")

    // const image =
    //   values.imageUrl instanceof File
    //     ? await uploadFile(values.imageUrl)
    //     : null

    // const video =
    //   values.videoUrl instanceof File
    //     ? await uploadFile(values.videoUrl)
    //     : null

    //   console.log({ image }, { video }, ".✨IMAGE AND VIDEO.")
      
      // await updateTask({
      //   ...values,
      //   imageUrl: image?.url || null,
      //   videoUrl: video?.url || null,
      // })
      return await updateTask({
        ...values,
      })
    },

    onSuccess: async () => {
      toast.success("Tarefa atualizada com sucesso! 🎉", {
        id: "update-task"
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "tasks"
        ]
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })

      reset()

      setOpen(prev => !prev)
    },
    onError: () => {
      toast.error("Aconteceu algo errado", {
        id: "update-task",
      })
    },
  })

  const onSubmit = useCallback((values: UpdateTaskSchemaType) => {
    console.log(values, 'values')
    toast.loading("Atualizando tarefa....", {
      id: "update-task"
    })

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
            <p>Atualizar tarefa</p>
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
                  render={() => (
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
                                    className="h-[50vh] overflow-y-auto"
                                    style={{ WebkitOverflowScrolling: "touch" }}
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

            {/* categories */}
            <div className="flex flex-col">
              <Label htmlFor="categories" className="text-sm font-medium">
                Vincular Categoria
              </Label>
              <CategoriePicker
                control={control}
              />
            </div>

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
                              console.log(e.target.files?.[0],"files")
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
              /> */}

              {/* <FormField
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
            <Dialog open={color} onOpenChange={setColor}>
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
            
            <DialogFooter className="flex gap-3 pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen
                  }}
                  className="flex-1 bg-transparent"
                  disabled={false}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90 shadow-md"
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? "Criando..." : "Atualizar tarefa"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

      </DialogContent>
    </Dialog>
  )
}

export default UpdateTaskDialog