"use client"

import React, { useState } from "react"

import { useForm, Controller } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from "@/components/ui/form"

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from "@/components/ui/tooltip"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { Uploader } from "@/components/uploader"

import { MessageSquare } from "lucide-react"

import type { CreateFeedbackSchemaType } from "@/lib/schema/feedback"
import axios from "axios"
import { createFeedback } from "@/app/habits/_actions/feedback/feedback"

interface Props {
  trigger?: React.ReactNode
}

const CreateFeedbackDialog: React.FC<Props> = ({ trigger }) => {

  const [open, setOpen] = useState(false)

  const form = useForm<CreateFeedbackSchemaType>({
    defaultValues: {
      type: "SUGGESTION",
      title: "",
      description: "",
      rating: 0,
      page: "",
      files: []
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = form

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (values: CreateFeedbackSchemaType) => {
      toast.loading("Enviando feedback...", {
        id: "create-feedback"
      })
      return await createFeedback(values)
    },

    onSuccess: async () => {
      toast.success(
        "Feedback enviado com sucesso 🚀",
        { id: "create-feedback" }
      )
      reset()
      await queryClient.invalidateQueries({
        queryKey: ["feedback"]
      })
      setOpen(false)

    },
    onError: () => {
      toast.error(
        "Erro ao enviar feedback",
        { id: "create-feedback" }
      )

    }

  })

  const onSubmit = (values: CreateFeedbackSchemaType) => {
   console.log(values, "values")

    mutate(values)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {trigger || (
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              Enviar Feedback
            </DialogHeader>
            <DialogDescription>
              Encontrou um bug ou tem uma sugestão?
            </DialogDescription>

            <Form {...form}>
              <form className="flex flex-col space-y-3">
                {/* TYPE */}
                <FormField
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tipo
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BUG">
                            Bug
                          </SelectItem>
                          <SelectItem value="SUGGESTION">
                            Sugestão
                          </SelectItem>
                          <SelectItem value="IMPROVEMENT">
                            Melhoria
                          </SelectItem>
                          <SelectItem value="OTHER">
                            Outro
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>

                  )}
                />

                {/* TITLE */}
                <FormField
                  control={control}
                  name="title"
                  rules={{
                    required: "O título do feedback é obrigatório.",
                    minLength: {
                      value: 3,
                      message: "O título precisa ter pelo menos 3 caracteres."
                    },
                    maxLength: {
                      value: 120,
                      message: "O título pode ter no máximo 120 caracteres."
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Título
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Descreva brevemente"
                          {...field}
                        />
                      </FormControl>
                      {errors.title && (
                        <span className="text-red-500 text-sm">
                          {errors.title.message}
                        </span>
                      )}
                    </FormItem>
                  )}
                />

                {/* DESCRIPTION */}
                <FormField
                  control={control}
                  name="description"
                  rules={{
                    required: "A descrição do feedback é obrigatória.",
                    minLength: {
                      value: 10,
                      message:
                        "A descrição precisa ter pelo menos 10 caracteres."
                    },
                    maxLength: {
                      value: 2000,
                      message:
                        "A descrição pode ter no máximo 2000 caracteres."
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Descrição
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Explique o feedback"
                          {...field}
                        />
                      </FormControl>
                      {errors.description && (
                        <span className="text-red-500">
                          {errors.description.message}
                        </span>
                    )}
                    </FormItem>

                  )}
                />

                {/* FILES */}
                <Controller
                  control={control}
                  name='files'
                  render={({ field }) => (
                    <Uploader
                      files={field.value}
                      onSuccessCallback={field.onChange}
                    />
                  )}
                />

              </form>

            </Form>

            <DialogFooter>

              <DialogClose asChild>

                <Button variant="outline">
                  Cancelar
                </Button>

              </DialogClose>

              <Button
                onClick={handleSubmit(onSubmit)}
              >
                Enviar
              </Button>

            </DialogFooter>

          </DialogContent>

        </Dialog>

      </TooltipTrigger>

      <TooltipContent>
        <p>Enviar feedback</p>
      </TooltipContent>

    </Tooltip>
  )
}

export default CreateFeedbackDialog