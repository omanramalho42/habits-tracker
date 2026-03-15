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
import axios from 'axios'

interface DeleteGoalDialogProps {
  goalId: string
  trigger?: React.ReactNode
}

function DeleteGoalDialog({
  goalId,
  trigger
}: DeleteGoalDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (values: string) => {
      return await axios.delete(`/api/goals/${values}`)
    },
    onSuccess: async () => {
      toast.success('Objetivo deletado com sucesso...', {
        id: goalId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['habits'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['goals'],
      })
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: goalId,
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
            seu objetivo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando objetivo...', {
                id: goalId,
              })
              deleteMutation.mutate(goalId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteGoalDialog
