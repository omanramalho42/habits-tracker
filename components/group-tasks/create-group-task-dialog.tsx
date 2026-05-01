"use client"

import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios from 'axios'

import { useApiError } from '@/hooks/use-alert-dialog'
import { AICreator } from '@/components/tasks/ai-creator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form'
import { Layers3, PlusSquare } from 'lucide-react'
import MultiTasksPicker from '../tasks/multi-tasks-picker'
import { CreateGroupTaskSchemaType } from '@/lib/schema/group-tasks'
import { HexColorPicker } from 'react-colorful'

interface CreateGroupTaskDialogProps {
  trigger?: React.ReactNode
}

const CreateGroupTaskDialog: React.FC<CreateGroupTaskDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false)
  const { handleError } = useApiError()
  const queryClient = useQueryClient()

  const form = useForm<CreateGroupTaskSchemaType>({
    defaultValues: {
      name: "",
      description: "",
      color: "",
      tasks: [],
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: CreateGroupTaskSchemaType) => {
      console.log(values, "values")
      return await axios.post(
        `/api/group-tasks`,
        values
      )
    },
    onSuccess: async (values) => {
      toast.success(
        "Grupo de tarefas criado! 📂",
        { id: "create-group" }
      )
      
      await queryClient.invalidateQueries({
        queryKey: ["group-tasks"]
      })

      console.log(values, "values ✨")
      
      form.reset()
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error("Erro ao criar grupo", { id: "create-group" })
      handleError(error)
    }
  })

  const onSubmit = useCallback((values: any) => {
    toast.loading("Criando grupo...", { id: "create-group" })
    mutate(values)
  }, [mutate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground w-full'>
            <PlusSquare className="mr-2 h-4 w-4" />
            Criar novo grupo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Layers3 className="text-primary" /> Criar Grupo de Tarefas
          </DialogTitle>
          <DialogDescription>
            Agrupe suas tarefas para organizar melhor sua rotina.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-4'>
            {/* NOME */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='ex: Manhã Produtiva, Trabalho...' />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* DESCRIÇÃO COM AI */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">Descrição</Label>
                <AICreator
                  reference={form.watch("name")}
                  type="group"
                  onGenerated={(text) => form.setValue("description", text)}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} placeholder="Explique o propósito deste grupo..." />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <HexColorPicker
                        color={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* SELEÇÃO DE TASKS */}
            <MultiTasksPicker
              control={form.control}
            />
          </form>
        </Form>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type='button' variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button
            type='button'
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending ? "Salvando..." : "Criar Grupo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupTaskDialog