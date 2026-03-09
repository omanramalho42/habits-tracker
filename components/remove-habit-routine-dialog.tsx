"use client"

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
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { removeHabitFromRoutine } from '@/services/routines'

interface RemoveHabitFromRoutineProps {
  routineId: string;
  habitScheduleId: string;
  trigger?: React.ReactNode;
}

function RemoveHabitFromRoutine({
  habitScheduleId,
  routineId,
  trigger
}: RemoveHabitFromRoutineProps) {
  const [open, setOpen] =
    useState<boolean>(false)

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ routineId, habitScheduleId }: {
      routineId: string;
      habitScheduleId: string
    }) => {
      return await removeHabitFromRoutine(
        routineId,
        habitScheduleId
      )
    },
    onSuccess: async () => {
      toast.success('Hábito removido com sucesso! 🎉', {
        id: habitScheduleId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })

      setOpen((prev) => !prev)
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: habitScheduleId,
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
            seu rotina.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Removendo hábito da rotina...', {
                id: habitScheduleId,
              })
              deleteMutation.mutate({ routineId, habitScheduleId })
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RemoveHabitFromRoutine
