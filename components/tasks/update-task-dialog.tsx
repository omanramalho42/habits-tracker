"use client"

import { useCallback, useState } from "react"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  useForm
} from "react-hook-form"

import { toast } from 'sonner'

import { EmojiPicker } from "frimousse"
import { createTask, updateTask } from "@/services/tasks"

import GoalPicker from "@/components/goal-picker"

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

import type { UpdateTaskSchemaType } from "@/lib/schema/task"
import { Categories, Goals, Task } from "@prisma/client"
import CategoriePicker from "../categorie-picker"

interface UpdateTaskDialogProps {
  trigger?: React.ReactNode
  onSuccessCallback?: (data: UpdateTaskSchemaType) => void
  task: Task & { goals?: Goals[], categories?: Categories[] }
}

const UpdateTaskDialog = ({ trigger, task }: UpdateTaskDialogProps) => {
  const [open, setOpen] = useState<boolean>(false)
  // const [color, setColor] = useState<boolean>(false)

  const today = new Date()
  today.setHours(0,0,0,0)

  const goalId = task.goals?.map((goal) => goal.id)[0] || ""
  const categorieId = task.categories?.map((categorie) => categorie.id)[0] || ""
  // const startDate = new Date(task.startDate)
  // startDate.setHours(0,0,0,0)

  const form = useForm<UpdateTaskSchemaType>({
    defaultValues: {
      id: task.id,
      name: task.name || "",
      goals: goalId,
      categories: categorieId,
      emoji: task.emoji || "",
      limitCounter: task.limitCounter || 1,
      custom_field: task.customField || ""
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
      console.log(values, "values")
      return await updateTask(values)
    },
    onSuccess: async () => {
      toast.success("Tarefa atualizada com sucesso! 🎉", {
        id: "update-task"
      })

      reset({
        emoji: "",
        goals: "",
        categories: "",
        name: "",
        limitCounter: 1,
        custom_field: ""
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "tasks"
        ]
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
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

                                  <EmojiPicker.Viewport className="h-72 overflow-y-auto">
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
            
            <div className="flex justify-between gap-4 items-center">
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
            </div>

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
                  disabled={!isSubmitting}
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