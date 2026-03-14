import React, { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

import { Trash2 } from 'lucide-react'
import { deleteTask } from '@/services/tasks'

interface DeleteTaskDialogProps {
  taskId: string
  trigger?: React.ReactNode
}

function DeleteTaskDialog({
  taskId,
  trigger
}: DeleteTaskDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (values: string) => {
      return await deleteTask(values)
    },
    onSuccess: async () => {
      toast.success('Tarefa deletada com sucesso! 🎉', {
        id: taskId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: taskId,
      })
    },
  })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>

      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className="text-sm text-red-500"
          >
            <Trash2 />
          </Button>
        )}

      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Você têm certeza absoluta?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Está ação não poderá ser desfeita. Isso vai exlcuir permanentemente
            sua tarefa e poderá causar efeitos em rotinas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando tarefa...', {
                id: taskId,
              })
              deleteMutation.mutate(taskId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteTaskDialog
