import React, { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { DeleteHabit } from '@/app/habits/_actions/habits/habits'

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
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface DeleteHabitDialogProps {
  habitId: string
  trigger?: React.ReactNode
}

function DeleteHabitDialog({
  habitId,
  trigger
}: DeleteHabitDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (values: string) => {
      return await DeleteHabit(values)
    },
    onSuccess: async () => {
      toast.success('Hábito deletado com sucesso! 🎉', {
        id: habitId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['habits'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: habitId,
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
            seu hábito.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando habito...', {
                id: habitId,
              })
              deleteMutation.mutate(habitId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteHabitDialog
