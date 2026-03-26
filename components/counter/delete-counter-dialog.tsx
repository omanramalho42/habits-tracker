import React, { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import axios from 'axios'

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

interface DeleteCounterDialogProps {
  counterId: string
  trigger?: React.ReactNode
}

function DeleteCounterDialog({
  counterId,
  trigger
}: DeleteCounterDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (values: string) => {
      return await axios.delete(`/api/counter/${counterId}`)
    },
    onSuccess: async () => {
      toast.success('Contador deletado com sucesso! 🎉', {
        id: counterId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['counters'],
      })
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: counterId,
      })
    },
  })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>

      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            type='button'
            role='combobox'
            aria-expanded={open}
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
            seu contador e afetar outras tarefas que compartilham deste mesmo contador.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando contador...', {
                id: counterId,
              })
              mutate(counterId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCounterDialog
