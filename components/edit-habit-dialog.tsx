"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HabitForm, type HabitFormData } from "@/components/habit-form"
import type { HabitWithStats } from "@/lib/types"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface EditHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: HabitFormData) => Promise<void>
  habit: HabitWithStats | null
}

export function EditHabitDialog({ open, onOpenChange, onSubmit, habit }: EditHabitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  if (!habit) return null

  const handleSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true)
    toast({
      title: "Atualizando hábito...",
      description: "Por favor, aguarde.",
    })

    try {
      await onSubmit(data)
      toast({
        title: "Sucesso!",
        description: "Hábito atualizado com sucesso.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar hábito. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Habit</DialogTitle>
        </DialogHeader>
        <HabitForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          initialData={habit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
