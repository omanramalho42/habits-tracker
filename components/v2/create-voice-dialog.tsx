"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Volume2 } from "lucide-react"

const schema = z.object({
  name: z.string().min(1),
  prompt: z.string().min(1),
  previewUrl: z.string().optional(),
})

type FormData = z.infer<typeof schema>

async function createVoice(data: FormData) {
  const res = await fetch("/api/voice", {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Erro ao criar voz")
  return res.json()
}

export default function CreateVoiceDialog({
  onVoiceCreated,
}: {
  onVoiceCreated?: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      prompt: "",
    },
  })

  const mutation = useMutation({
    mutationFn: createVoice,
    onSuccess: (voice) => {
      toast.success("Voz criada 🎤")
      queryClient.invalidateQueries({ queryKey: ["voices"] })
      onVoiceCreated?.(voice.id)
      setOpen(false)
      form.reset()
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-orange-500">
          <Plus className="size-4" />
          Nova voz
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0d0808] border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-orange-500 flex items-center gap-2">
            <Volume2 className="size-4" />
            Criar Voz
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Voz Masculina Calma" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Leve, sedudora, fala pausada." />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previewUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="url do audio" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Salvando..." : "Criar Voz"}
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}