"use client"

import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Wand2, Paperclip, ImageIcon, Sparkles, Plus } from "lucide-react"
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { generateEmojiAction } from "@/app/_actions/emoji.actions"

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  imageUrl: z.string().min(1, "Imagem obrigatória"),
})

type FormData = z.infer<typeof formSchema>

async function createEmoji(data: { name: string; imageUrl: string }) {
  const res = await fetch("/api/emoji", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Erro ao criar emoji")
  return res.json()
}

export default function CreateEmojiDialog({
  onEmojiCreated,
  trigger
}: {
  onEmojiCreated?: (id: string) => void,
  trigger?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [aiPreview, setAiPreview] = useState<string | null>(null)
  const [selectedSource, setSelectedSource] = useState<"original" | "ai" | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  })

  const createMutation = useMutation({
    mutationFn: createEmoji,
    onSuccess: (newEmoji) => {
      queryClient.invalidateQueries({ queryKey: ["emojis"] })
      toast.success("Emoji criado 🚀")

      onEmojiCreated?.(newEmoji.id)

      setOpen(false)
      form.reset()
      setOriginalPreview(null)
      setAiPreview(null)
      setSelectedSource(null)
      setSelectedFile(null)
    },
  })

  const handleGenerateWithAI = async () => {
    const name = form.getValues("name")

    if (!name) {
      form.setError("name", {
        message: "Dê um nome para a IA"
      })
      return
    }

    setIsGeneratingAI(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("generateAI", "true")

      if (selectedFile) {
        formData.append("attachment", selectedFile)
      }

      const result = await generateEmojiAction(formData)

      if (result.success && result.url) {
        setAiPreview(result.url)
        setSelectedSource("ai")

        form.setValue("imageUrl", result.url, {
          shouldValidate: true,
        })
      }
    } catch (error) {
      toast.error("Erro na IA")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    let finalUrl = data.imageUrl

    if (data.imageUrl.startsWith("data:") && selectedFile) {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("attachment", selectedFile)
      formData.append("generateAI", "false")

      const result = await generateEmojiAction(formData)
      if (!result.url) return

      finalUrl = result.url
    }

    createMutation.mutate({
      name: data.name,
      imageUrl: finalUrl,
    })
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setSelectedFile(file)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string

      setOriginalPreview(base64)
      setSelectedSource("original")

      form.setValue("imageUrl", base64, {
        shouldValidate: true,
      })
    }

    reader.readAsDataURL(file)
  }

  return (
    <>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        {/* BOTÃO */}
        <DialogTrigger asChild>
          {trigger || (
            <motion.button
              initial={{ opacity: 0, y: 10 }} // Reduzido y para animação mais sutil
              animate={{ opacity: 1, y: 0 }}
              // ✅ Animação de entrada MAIS RÁPIDA (0.2s tween)
              transition={{ type: "tween", duration: 0.2, delay: 0.1 }} 
              whileHover={{ 
                scale: 1.01, // Reduzido scale para w-full
                boxShadow: "0 0 25px rgba(255,90,61,0.3)", 
              }}
              whileTap={{ scale: 0.99 }}
              aria-expanded={open}
              // ✅ w-full e arredondamento menor
              className="group relative w-full overflow-hidden rounded-xl" 
            >
              {/* Outer neon glow */}
              <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-[#ff3d1d] via-[#ff5a3d] to-[#cc2211] opacity-60 blur-md transition-all duration-150 group-hover:opacity-90 group-hover:blur-lg" />
              
              {/* Button container */}
              {/* ✅ Ajustado: py-2 (antes py-4), px-4 (antes px-8) e w-full */}
              <div className="relative flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#ff5a3d]/40 bg-linear-to-br from-[#1a0808]/95 via-[#200a0a]/90 to-[#150505]/95 px-4 py-2 backdrop-blur-xl transition-all duration-150 group-hover:border-[#ff7a5c]/60">
                {/* Inner glass reflection */}
                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/10 via-transparent to-transparent" />
                
                {/* Animated sparkles */}
                <motion.div
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    // ✅ Animação MAIS RÁPIDA (1s)
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative shrink-0"
                >
                  <Sparkles className="size-4 text-[#ff8a70]" /> {/* Reduzido de 5 para 4 */}
                </motion.div>
                
                {/* Icon */}
                {/* ✅ Ajustado: size-7 (antes size-10) */}
                <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#ff5a3d] to-[#cc3311] shadow-[0_0_15px_rgba(255,90,61,0.3)]">
                  <Plus className="size-4 text-white" /> {/* Reduzido de 5 para 4 */}
                </div>
                
                {/* Text */}
                {/* ✅ Ajustado: text-sm (antes text-lg) */}
                <span className="relative bg-linear-to-r from-[#ffd0c0] via-[#ffb090] to-[#ff8a70] bg-clip-text text-sm font-bold tracking-wide text-transparent whitespace-nowrap">
                  Novo Emoji
                </span>
              </div>
              
              {/* Animated border glow */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,90,61,0.3), transparent)",
                  backgroundSize: "200% 100%",
                }}
                animate={{
                  backgroundPosition: ["200% 0", "-200% 0"],
                }}
                transition={{
                  // ✅ Animação MAIS RÁPIDA (2s)
                  duration: 2, 
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-[#0d0808] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-orange-500">
              Criar Emoji
            </DialogTitle>
            <DialogDescription>
              Gere com IA ou envie uma imagem
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* CONTROLES */}
              <div className="flex justify-between">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={onFileChange}
                />

                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="size-4 text-white/50" />
                </button>

                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-2 text-xs text-orange-400"
                >
                  {isGeneratingAI ? <Spinner className="size-3" /> : <Wand2 className="size-3" />}
                  IA
                </button>
              </div>

              {/* PREVIEWS */}
              <div className="grid grid-cols-2 gap-2">
                <Preview
                  src={originalPreview}
                  active={selectedSource === "original"}
                  onClick={() => {
                    setSelectedSource("original")
                    form.setValue("imageUrl", originalPreview!)
                  }}
                  label="Original"
                />

                <Preview
                  src={aiPreview}
                  active={selectedSource === "ai"}
                  loading={isGeneratingAI}
                  onClick={() => {
                    setSelectedSource("ai")
                    form.setValue("imageUrl", aiPreview!)
                  }}
                  label="IA"
                />
              </div>

              {/* NAME */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Nome..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={createMutation.isPending || isGeneratingAI}
                className="w-full bg-orange-600 py-2 text-white rounded"
              >
                {createMutation.isPending ? "Salvando..." : "Salvar"}
              </button>

            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Preview({ src, active, onClick, label, loading }: any) {
  return (
    <div
      onClick={src && !loading ? onClick : undefined}
      className={`h-24 flex items-center justify-center border rounded ${
        active ? "border-orange-500" : "border-white/10"
      }`}
    >
      {loading ? (
        <Spinner />
      ) : src ? (
        <img src={src} className="h-12" />
      ) : (
        <span className="text-xs text-white/30">{label}</span>
      )}
    </div>
  )
}