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
  DialogDescription,
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
import { Plus, Volume2, Check, Sparkles } from "lucide-react"
import axios from "axios"
import { VoicePreviewPlayer } from "./voice-preview-player"

const schema = z.object({
  name: z.string().min(1, "Dê um nome para sua voz"),
  description: z.string().min(10, "Descreva a voz com mais detalhes"),
  gender: z.enum(["male", "female"]),
  age: z.enum(["young", "middle_aged", "old"]),
  accent_strength: z.number().min(0.3).max(2.0).default(1.0),
})

type FormData = z.infer<typeof schema>

export default function CreateVoiceDialog({ onVoiceCreated }: { onVoiceCreated?: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      gender: "male",
      age: "young",
      accent_strength: 1.0,
    },
  })

  // 1. Mutação apenas para GERAR a voz na ElevenLabs (Preview)
  const generateMutation = useMutation({
    mutationFn: async (data: any) => {
      toast.loading("Sintetizando voz", { id: 'create-voice' })
      console.log(data, 'data')
      const res = await axios.post(
        "/api/ia/voice/generator",
        data
      )
      console.log(res.data, "response")
      return res.data
    },
    onSuccess: (data) => {
      setLastGeneratedId(data.id)
      toast.success("DNA Vocal sintetizado! Ouça o preview abaixo.", {
        id: 'create-voice'
      })
      
      if (data.previewAudio) {
        const audio = new Audio(data.previewAudio)
        audio.play().catch(e => console.error("Erro ao tocar áudio:", e))
      }
    },
    onError: () => toast.error("Falha ao gerar preview da voz.", {
      id: 'create-voice'
    })
  })

  // 2. Mutação para SALVAR a voz definitivamente no seu DB
  const saveMutation = useMutation({
    mutationFn: async () => {
      const currentValues = form.getValues()
      const res = await axios.post("/api/ia/voice/save", {
        ...currentValues,
        voiceId: lastGeneratedId
      })
      return res.data
    },
    onSuccess: (data) => {
      console.log(data, "data")
      toast.success("Voz salva na sua biblioteca! 🎤")
      queryClient.invalidateQueries({
        queryKey: ["voices"]
      })
      onVoiceCreated?.(lastGeneratedId!)
      handleClose()
    }
  })

  const handleClose = () => {
    setOpen(false)
    setLastGeneratedId(null)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val ? handleClose() : setOpen(true)}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-2 text-orange-500 hover:bg-orange-500/10">
          <Plus className="size-4" />
          Gerar Voz Única (ElevenLabs)
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-[#0d0808] w-[95vw] max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto border-white/10 shadow-[0_0_40px_rgba(234,88,12,0.15)]">
        <DialogHeader>
          <DialogTitle className="text-orange-500 flex items-center gap-2">
            <Volume2 className="size-5" />
            Voice Designer
          </DialogTitle>
          <DialogDescription className="text-white/40">
            Crie a voz, ouça o resultado e confirme para salvar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Nome da Identidade</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!!lastGeneratedId} className="bg-white/5 border-white/10" placeholder="Ex: Hacker Sarcástico" />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Campos de Gênero e Idade (Omitidos aqui para brevidade, mantenha os seus) */}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Personalidade (Prompt)</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field} 
                      disabled={!!lastGeneratedId}
                      className="w-full min-h-20 rounded-md bg-white/5 border border-white/10 p-3 text-sm focus:border-orange-500/50 outline-none"
                      placeholder="Descreva o tom e estilo..."
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* AREA DE PREVIEW - SÓ APARECE APÓS GERAR */}
            {lastGeneratedId && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <VoicePreviewPlayer voiceId={lastGeneratedId} />
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {!lastGeneratedId ? (
                <Button
                  type="button"
                  onClick={form.handleSubmit((data) => generateMutation.mutate(data))}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2"
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? "Sintetizando DNA Vocal..." : (
                    <>
                      <Sparkles className="size-4" />
                      Gerar Amostra de Voz
                    </>
                  )}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLastGeneratedId(null)}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    Tentar Outra
                  </Button>
                  <Button
                    type="button"
                    onClick={() => saveMutation.mutate()}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? "Salvando..." : (
                      <>
                        <Check className="size-4" />
                        Confirmar e Salvar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}