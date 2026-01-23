"use client"

import React, { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { createAnnotation } from '@/app/habits/_actions/annotations/annotations'


import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Uploader } from "@/components/uploader"
import { Button } from '@/components/ui/button'

import { File } from "lucide-react"

import type { CreateAnnotationSchemaType } from '@/lib/schema/annotations'

interface CreateAnnotationDialogProps {
  completionId: string
}

const CreateAnnotationDialog:React.FC<CreateAnnotationDialogProps> = ({ completionId }) => {
  const [open, setOpen] = useState<boolean>(false)

  const form = useForm<CreateAnnotationSchemaType>({
    defaultValues: {
      name: "",
      summary: "",
      files: [],
      completionId
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState:
      { errors }
  } = form

  const onSubmit = (values: CreateAnnotationSchemaType) => {
    console.log(values, "values")
    mutate({
      completionId,
      name: values.name,
      files: values.files,
      summary: values.summary
    })
  }

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (values: CreateAnnotationSchemaType) => {
      toast.loading("Criando anotação...", { id: 'create-annotation' })
      
      return await createAnnotation(values)
    },
    onSuccess: async () => {
      toast.success(
        "Sucesso ao criar anotação. 🎉", 
        { id: "create-annotation" }
      )

      reset({
        completionId: "",
        files: [],
        name: "",
        summary: ""
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "habits"
        ]
      })

      setOpen(prev => !prev)
    },
    onError: () => {
      toast.error(
        "Erro ao criar anotação...", 
        { id: "create-annotation" }
      )
    }
  })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full"
            >
              <File className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className='text-start'>
              Anotações
            </DialogHeader>
            <DialogDescription>
              Um breve resumo do seu dia:
            </DialogDescription>
            <Form {...form}>
              <form className="flex flex-col space-y-3">
                <FormField
                  control={control}
                  name='name'
                  rules={{ required: true }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Label htmlFor='name'>
                          Nome
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="ex: conhecimento do dia..."
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      {errors && 
                          errors.name && (
                            <span
                              className='text-red-500 text-sm font-medium'
                            >
                              {errors.name.message}
                            </span>
                        )
                      }
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name='summary'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <Label htmlFor='summary'>
                          Resumo
                        </Label>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          id="summary"
                          className=""
                          placeholder="Faça um breve resumo do seu dia aqui..."
                          rows={4}
                          onChange={field.onChange}
                          value={field.value}
                        />
                      </FormControl>
                      {errors && 
                          errors.summary && (
                            <span
                              className='text-red-500 text-sm font-medium'
                            >
                              {errors.summary.message}
                            </span>
                        )
                      }
                    </FormItem>
                  )}
                />
                
                <Controller
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
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipTrigger>
      <TooltipContent>
        <p>Adicione seu arquivo aqui</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default CreateAnnotationDialog