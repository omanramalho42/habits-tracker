"use client"

import React from 'react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteGroupTaskDialogProps {
  groupId: string
  groupName: string
  trigger?: React.ReactNode
}

export function DeleteGroupTaskDialog({ groupId, groupName, trigger }: DeleteGroupTaskDialogProps) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      return await axios.delete(`/api/group-tasks/${groupId}`)
    },
    onSuccess: () => {
      toast.success("Grupo excluído com sucesso")
      queryClient.invalidateQueries({ queryKey: ["group-tasks"] })
    },
    onError: () => {
      toast.error("Ocorreu um erro ao excluir o grupo")
    }
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso excluirá o grupo <strong>{groupName}</strong> permanentemente. 
            As tarefas vinculadas não serão excluídas, apenas deixarão de estar agrupadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => mutate()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? "Excluindo..." : "Confirmar Exclusão"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}