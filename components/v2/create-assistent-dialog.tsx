"use client"

import React, { useState } from "react"
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import { Plus } from "lucide-react"

// 👉 você pode reaproveitar seu EmojiPicker depois
import EmojiPicker from "@/components/v2/emoji-picker"
import CreateEmojiDialog from "./create-emoji-dialog"
import CustomEmojiPicker from "@/components/v2/emoji-picker"
import VoicePicker from "./voice-picker"
import { Label } from "../ui/label"
import { AICreator } from "../tasks/ai-creator"

const schema = z.object({
  name: z.string().min(1),
  emojiId: z.string().min(1),
  prompt: z.string().optional(),
  voiceId: z.string().optional(),
  temperature: z.number().min(0).max(1),
  creativity: z.number().min(0).max(1),
  memoryEnabled: z.boolean(),
})

type FormData = z.infer<typeof schema>

async function createAssistant(data: any) {
  console.log(data, 'data');
  const res = await fetch("/api/ia", {
    method: "POST",
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Erro ao criar assistant")
  return res.json()
}

export default function CreateAssistantDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      prompt: "",
      voiceId: "",
      temperature: 0.7,
      creativity: 0.5,
      memoryEnabled: true,
    },
  })

  const mutation = useMutation({
    mutationFn: createAssistant,
    onSuccess: () => {
      toast.success("Assistant criado 🚀")
      queryClient.invalidateQueries({
        queryKey: ["assistants"]
      })
      setOpen(false)
      form.reset()
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="size-4" />
            Criar Assistant
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-autobg-[#0d0808] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-orange-500">
            Novo Assistant
          </DialogTitle>
          <DialogDescription>
            Crie seu assistente inteligente personalizado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* EMOJI */}
            <FormField
              control={form.control}
              name="emojiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji (Mascote)</FormLabel>
                  <FormControl>
                    <CustomEmojiPicker
                      control={form.control}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* NAME */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Mentor AI" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* PROMPT */}
                <div className="flex flex-col gap-2 w-full mt-2">
                  <div className="flex flex-row items-center gap-1 justify-between">
                    <Label htmlFor="description" className="text-sm font-semibold">
                      Prompt
                    </Label>

                    <AICreator
                      reference={form.watch("prompt") || form.watch("name")}
                      type="routine" 
                      onGenerated={
                        (text) => form.setValue("prompt", text)
                      } 
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="prompt"
                    rules={{ required: false, min: 5 }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            {...field}
                            id="description"
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Detalhes sobre sua nova rotina..."
                          />
                        </FormControl>
                        {form.formState.errors && form.formState.errors.prompt && (
                          <span className='text-red-500 text-sm'>
                            {form.formState.errors.prompt.message}
                          </span>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

            
            <VoicePicker
              control={form.control}
            />

            {/* TEMPERATURE */}
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperatura ({field.value})</FormLabel>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormItem>
              )}
            />

            {/* CREATIVITY */}
            <FormField
              control={form.control}
              name="creativity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Criatividade ({field.value})</FormLabel>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </FormItem>
              )}
            />

            {/* MEMORY */}
            <FormField
              control={form.control}
              name="memoryEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Memória ativa</FormLabel>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormItem>
              )}
            />

            {/* FUTURO: TASKS / HABITS */}
            <div className="text-xs text-white/40">
              🔥 Em breve: vincular tarefas e hábitos
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Criando..." : "Criar Assistant"}
            </Button>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}