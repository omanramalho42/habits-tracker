"use client"

import React, { useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { toast } from 'sonner'

import { removeHabitSchedule } from '@/services/habit-schedules'

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
import { removeTaskSchedule } from '@/services/task-schedule'

interface DeleteTaskScheduleDialogProps {
  routineId: string;
  taskScheduleId: string;
  trigger?: React.ReactNode;
}

function DeleteTaskScheduleDialog({
  taskScheduleId,
  routineId,
  trigger
}: DeleteTaskScheduleDialogProps) {
  const [open, setOpen] =
    useState<boolean>(false)

  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async ({ routineId, taskScheduleId }: {
      routineId: string;
      taskScheduleId: string
    }) => {
      return await removeTaskSchedule(
        routineId,
        taskScheduleId
      )
    },
    onSuccess: async () => {
      toast.success('Tarefa removida com sucesso! 🎉', {
        id: taskScheduleId,
      })

      await queryClient.invalidateQueries({
        queryKey: ['routines'],
      })

      setOpen((prev) => !prev)
    },
    onError: () => {
      toast.error('Aconteceu algo de errado', {
        id: taskScheduleId,
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
              toast.loading('Removendo tarefa da rotina...', {
                id: taskScheduleId,
              })
              deleteMutation.mutate({
                routineId,
                taskScheduleId
              })
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteTaskScheduleDialog
