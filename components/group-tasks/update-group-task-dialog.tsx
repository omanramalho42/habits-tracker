"use client"

import React, { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import axios from 'axios'

import MultiTasksPicker from '../tasks/multi-tasks-picker'

import { HexColorPicker } from 'react-colorful'

import { useApiError } from '@/hooks/use-alert-dialog'
import { AICreator } from '@/components/tasks/ai-creator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

import { UpdateGroupTaskSchemaType } from '@/lib/schema/group-tasks'

import { Layers3, Edit2 } from 'lucide-react'

import type { GroupTask, Task } from '@prisma/client'

interface UpdateGroupTaskDialogProps {
  trigger?: React.ReactNode
  group: GroupTask & {
    tasks?: Task[]
  }
}

const UpdateGroupTaskDialog: React.FC<UpdateGroupTaskDialogProps> = ({ trigger, group }) => {
  const [open, setOpen] = useState(false)
  const { handleError } = useApiError()
  const queryClient = useQueryClient()

  const form = useForm<UpdateGroupTaskSchemaType>({
    defaultValues: {
      name: group.name,
      description: group.description || "",
      tasks: group.tasks?.map((t: any) => t.id) || [],
      color: group.color || "",
    }
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: UpdateGroupTaskSchemaType) => {
      console.log(values, "values 🔥")
      // console.log(group.id, "id")
      return await axios.patch(
        `/api/group-tasks/${group.id}`,
        values
      )
    },
    onSuccess: async () => {
      toast.success(
        "Grupo atualizado! 📂", {
          id: "update-group"
        })
      queryClient.invalidateQueries({
        queryKey: ["group-tasks"]
      })
      setOpen(false)
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar grupo", {
        id: "update-group"
      })
      handleError(error)
    }
  })

  const onSubmit = useCallback((values: UpdateGroupTaskSchemaType) => {
    toast.loading("Salvando alterações...", {
      id: "update-group"
    })
    mutate(values)
  }, [mutate])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="w-[95vw] scroll-container max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Layers3 className="text-primary" /> Editar Grupo
          </DialogTitle>
          <DialogDescription>
            Altere as informações ou as tarefas deste grupo.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Nome do Grupo
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="font-semibold text-sm">
                  Descrição
                </Label>
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
                      <Textarea {...field} />
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

            <MultiTasksPicker
              control={form.control}
            />
          </form>
        </Form>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="ghost">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isPending 
              ? "Salvando..." 
              : "Salvar Alterações"
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateGroupTaskDialog