"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HabitForm, type HabitFormData } from "@/components/habit-form"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface CreateHabitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: HabitFormData) => Promise<void>
}

export function CreateHabitDialog({ open, onOpenChange, onSubmit }: CreateHabitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (data: HabitFormData) => {
    setIsSubmitting(true)
    toast({
      title: "Criando hábito...",
      description: "Por favor, aguarde.",
    })

    try {
      await onSubmit(data)
      toast({
        title: "Sucesso!",
        description: "Hábito criado com sucesso.",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao criar hábito. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a New Habit</DialogTitle>
        </DialogHeader>
        <HabitForm onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  )
}
