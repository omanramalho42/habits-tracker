"use client"

import React, { useState } from 'react'

import { Controller, useForm } from 'react-hook-form'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import axios from 'axios'
import { AICreator } from '@/components/tasks/ai-creator'

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

import type { UpdateAnnotationSchemaType } from '@/lib/schema/annotations'
import type { Annotations } from '@prisma/client'
import EditorText from './editor-text'

interface UpdateAnnotationDialogProps {
  annotation: Annotations
  trigger?: React.ReactNode
}

const UpdateAnnotationDialog:React.FC<UpdateAnnotationDialogProps> = ({ annotation, trigger }) => {
  const [open, setOpen] = useState<boolean>(false)
  const form = useForm<UpdateAnnotationSchemaType>({
    defaultValues: {
      id: annotation.id,
      name: annotation.name || "",
      summary: annotation.summary || "",
      completionId: annotation.completionId,
      files: [],
    }
  })

  const {
    control,
    handleSubmit,
    reset,
    formState:
      { errors }
  } = form

  const onSubmit = (values: UpdateAnnotationSchemaType) => {
    console.log(values, "values")
    mutate({
      id: values.id,
      name: values.name,
      files: values.files,
      summary: values.summary,
      completionId: values.completionId
    })
  }

  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (values: UpdateAnnotationSchemaType) => {
      toast.loading("Atualizando anotação...", {
        id: 'update-annotation'
      })
      
      return await axios.patch(
        `/api/annotations/${values.id}`, values
      )
    },
    onSuccess: async () => {
      toast.success(
        "Sucesso ao atualizazr anotação. 🎉", 
        { id: "update-annotation" }
      )

      await queryClient.invalidateQueries({
        queryKey: [
          "annotations"
        ]
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
        "Erro ao atualizar anotação...", 
        { id: "update-annotation" }
      )
    }
  })

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
                <File className="h-4 w-4" />
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className='w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
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

                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="summary" className="text-sm font-semibold">
                      Resumo
                    </Label>

                    <AICreator
                      reference={form.watch("name")}
                      type="annotation" 
                      onGenerated={
                        (text) => form.setValue("summary", text)
                      } 
                    />
                  </div>

                 <FormField
                    control={control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <EditorText
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        {errors && errors.summary && (
                          <span className='text-red-500 text-sm'>
                            {errors.summary.message}
                          </span>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                
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

export default UpdateAnnotationDialog