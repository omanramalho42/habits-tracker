"use client"

import React, { useCallback, useState } from 'react'

import { toast } from 'sonner'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import { CreateGoal } from '@/app/habits/_actions/goals/goals'
import type { CreateGoalSchemaType } from '@/lib/schema/goal'

import { EmojiPicker } from "frimousse"

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
import { Card } from '@/components/ui/card'

import { CircleOff, PlusSquare } from 'lucide-react'
import { useApiError } from '@/hooks/use-alert-dialog'
import { AlertModalDialog } from '../modals/alert-modal-dialog'
import GoalsDialog from '@/app/wizzard/components/goals-dialog'
import { Goals } from '@prisma/client'
import axios from 'axios'

interface CreateGoalDialogProps {
  trigger?: React.ReactNode
}

const CreateGoalDialog:React.FC<CreateGoalDialogProps> = ({ trigger }) => {
  const [showGoals, setShowGoals] = useState(false)
  const [goalsData, setGoalsData] = useState<any>()
  const {
    open: alertOpen,
    setOpen: setAlertOpen,
    message,
    handleError
  } = useApiError()

  const [open, setOpen] = useState<boolean>(false)
  
  const form = useForm<CreateGoalSchemaType>({
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
    mutationFn: async (values: CreateGoalSchemaType) => {
      console.log(values, "values")
      return await axios.post(`/api/goals`, values)
    },
    onSuccess: async ({ data }) => {
      toast.success("Objetivo criado com sucesso! 🎉", {
        id: "create-goal"
      })
      if(data) {
        // console.log(data, 'data ⚠️')
        setShowGoals(true)
      }
      setGoalsData(data)
      reset({
        name: "",
        description: "",
        emoji: "",
      })
      await queryClient.invalidateQueries({
        queryKey: [
          "goals"
        ]
      })

      setOpen(prev => !prev)
    },
    onError: (error: any) => {
      console.log(error, "error")
      // handleApiError(error, handleError)
      toast.error(`Aconteceu algo errado: ${error}`, {
        id: "create-goal",
      })
    }
  })

  const onSubmit = useCallback((values: CreateGoalSchemaType) => {
    toast.loading("Criando objetivo....", { id: "create-goal" })

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
            Criar novo
          </Button>
        )}
      </DialogTrigger>
      
      <GoalsDialog
        data={goalsData}
        isOpen={showGoals}
        onClose={() => {
          setShowGoals(false)
        }}
      />

      <DialogContent className="max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Criar objetivo
          </DialogTitle>
          <DialogDescription>
            criar objetivo organiza seus hábitos
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
                  
                  {errors && errors.description && (<span className='text-red-500 text-sm'>{errors.description.message}</span>)}
                </FormItem>
              )}
            />
            {/* ICONE */}
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
                            <Card className="w-full p-2 h-full cursor-pointer">
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
                            side="bottom"
                            align="center"
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
      <AlertModalDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description={message}
      />
    </Dialog>
  )
}

export default CreateGoalDialog