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

interface DeleteCategorieDialogProps {
  categorieId: string
  trigger?: React.ReactNode
}

function DeleteCategorieDialog({
  categorieId,
  trigger
}: DeleteCategorieDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (values: string) => {
      return await axios.delete(`/api/categories/${categorieId}`)
    },
    onSuccess: async () => {
      toast.success('Categoria deletada com sucesso! 🎉', {
        id: categorieId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['habits'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: categorieId,
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
            sua categoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deletando categoria...', {
                id: categorieId,
              })
              deleteMutation.mutate(categorieId)
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteCategorieDialog
