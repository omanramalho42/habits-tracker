"use client"

import React, { useCallback, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import Picker from "@emoji-mart/react"
import data from "@emoji-mart/data"
import { toast } from 'sonner'

import { CreateGoal } from '@/app/habits/_actions/goals/goals'

import {
  Dialog,
  DialogClose,
  DialogContent, 
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form, 
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'

import { CircleOff, PlusSquare } from 'lucide-react'

import type { CreateCategorieSchemaType } from '@/lib/schema/categorie'

interface CreateCategorieDialogProps {
  trigger?: React.ReactNode
}

const CreateCategorieDialog:React.FC<CreateCategorieDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState<boolean>(false)
  
  const form = useForm<CreateCategorieSchemaType>({
    defaultValues: {
      name: "",
      description: "",
      emoji: "",
      status: "ACTIVE",
    }
  })

  const {
    handleSubmit,
    control,
    reset,
    formState: {
      errors,
      isLoading,
      isSubmitting
    }
  } = form

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateCategorieSchemaType) => {
      console.log(values, "values")
      return await CreateGoal(values)
    },
    onSuccess: async () => {
      toast.success("Categoria criado com sucesso! 🎉", {
        id: "create-categorie"
      })
      reset({
        name: "",
        description: "",
        emoji: "",
      })

      await queryClient.invalidateQueries({
        queryKey: [
          "categories"
        ]
      })

      setOpen(prev => !prev)
    },
    onError: () => {
      toast.error("Aconteceu algo errado", {
        id: "create-categorie",
      })
    }
  })

  const onSubmit = useCallback((values: CreateCategorieSchemaType) => {
    toast.loading("Criando categoria....", { id: "create-categorie" })

    mutate(values)
  },[])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'
          >
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar nova
          </Button>
        )}
      </DialogTrigger>


      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Criar categoria
          </DialogTitle>
          <DialogDescription>
            criar categoria organiza seus hábitos e tarefas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-3'>
            <FormField
              name='name'
              rules={{ required: true }}
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="name"
                      className="text-sm font-semibold"
                    >
                      Nome
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="name"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='ex: Emagrecer...'    
                    />
                  </FormControl>
                  
                  {errors && errors.name && (
                    <span className='text-red-500 text-sm'>
                      {errors.name.message}
                    </span>
                  )}
                </FormItem>
              )}
            />
            <FormField
              name='description'
              disabled={isLoading}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold"
                    >
                      Descrição
                    </Label>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      id="description"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder='ex: Conquistar o tão sonhado peso...'    
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
            {/* ICONE */}
            <FormField
              control={control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Icone
                  </FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full min-h-16 sm:min-h-25"
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <span className="text-3xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Toque para trocar
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-1">
                              <CircleOff className="h-8 w-8 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Toque para selecionar
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        side="bottom"
                        align="center"
                        className="
                          w-[90vw] max-w-sm
                          sm:w-105
                          p-0
                          max-h-[80vh]
                          overflow-hidden
                        "
                      >
                        <div className="max-h-[70vh]">
                          <Picker
                            data={data}
                            theme="dark"
                            disabled={isSubmitting}
                            navPosition="bottom"
                            previewPosition="top"
                            searchPosition="sticky"
                            skinTonePosition="preview"
                            onEmojiSelect={(emoji: { native: string }) => {
                              field.onChange(emoji.native)
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                </FormItem>
              )}
            />

          </form>
        </Form>

        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant="ghost">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type='button'
            disabled={isSubmitting || isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}

export default CreateCategorieDialog